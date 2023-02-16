import { Stack } from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as gateway from "aws-cdk-lib/aws-apigateway";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as targets from "aws-cdk-lib/aws-route53-targets";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cognito from "aws-cdk-lib/aws-cognito";
import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";
import { PythonLambdaProps, PythonLambda } from "./lambda-functions";
import { IConfig } from "../config";
import * as path from "path";

export interface LambdaApiProps {
  Config: IConfig;
  apiDomain: string;
  dynamoTable: dynamodb.ITable;
  assetBucket: s3.IBucket;
  cognitoUserPool: cognito.IUserPool;
  certificate: acm.ICertificate;
  hostedZone: route53.IHostedZone;
}

export class LambdaApi extends Construct {
  function: lambda.Function;
  api: gateway.RestApi;

  constructor(parent: Stack, name: string, props: LambdaApiProps) {
    super(parent, name);

    const {
      Config,
      apiDomain,
      dynamoTable,
      assetBucket,
      cognitoUserPool,
      certificate,
      hostedZone,
    } = props;

    const lambdaConstructProps: PythonLambdaProps = {
      pathName: path.resolve(
        Config.environment.basePath,
        "lambdas",
        Config.pythonLambdas.appServer.codeDirectory
      ),
      environment: {
        DDB_TABLE_NAME: dynamoTable.tableName,
        LOG_LEVEL: Config.pythonLambdas.appServer.logLevel,
        POWERTOOLS_SERVICE_NAME: Config.pythonLambdas.appServer.codeDirectory,
        ASSET_BUCKET_NAME: assetBucket.bucketName,
      },
      lambdaBuildCommands: Config.pythonLambdas.buildCommands,
    };

    const lambdaConstruct = new PythonLambda(
      parent,
      "Function",
      lambdaConstructProps
    );

    dynamoTable.grantReadWriteData(lambdaConstruct.fnRole);
    assetBucket.grantReadWrite(lambdaConstruct.fnRole);

    const api = new LambdaRestApi(this, "Gateway", {
      handler: lambdaConstruct.function,
      proxy: false,
      domainName: {
        domainName: apiDomain,
        certificate,
        endpointType: gateway.EndpointType.EDGE,
        basePath: "resources",
      },
      defaultCorsPreflightOptions: {
        allowOrigins: gateway.Cors.ALL_ORIGINS,
      },
    });

    new route53.ARecord(this, "AliasRecord", {
      recordName: apiDomain,
      target: route53.RecordTarget.fromAlias(new targets.ApiGateway(api)),
      zone: hostedZone,
    });

    const userResourceAuthorizer = new gateway.CfnAuthorizer(
      this,
      "GatewayAuth",
      {
        restApiId: api.restApiId,
        name: "request-authorizer",
        type: gateway.AuthorizationType.COGNITO,
        identitySource: "method.request.header.Authorization",
        providerArns: [cognitoUserPool.userPoolArn],
      }
    );

    this.addResourcesToApi(
      api,
      userResourceAuthorizer,
      lambdaConstruct.function
    );

    this.function = lambdaConstruct.function;
    this.api = api;
  }

  private addResourcesToApi(
    api: gateway.RestApi,
    userResourceAuthorizer: gateway.CfnAuthorizer,
    baseFunction: lambda.Function
  ): void {
    const resources = [
      {
        resourceName: "ping",
        methods: ["GET"],
      },
      {
        resourceName: "user",
        // POST Create New User
        // PUT Update User's Information, i.e. preferences
        // DELETE Delete User's Account
        methods: ["POST", "PUT", "DELETE"],
      },
      {
        resourceName: "photos",
        // GET Get All Photos By User
        // DELETE Delete photo from user account
        methods: ["GET", "DELETE"],
      },
      {
        resourceName: "photo",
        // POST Generate pre-signed URL for photo upload
        methods: ["POST"],
      },
      {
        resourceName: "photo_manifest",
        methods: ["POST"],
      },
    ];

    resources.forEach((resource) => {
      const { resourceName, methods } = resource;
      const addedResource = api.root.addResource(resourceName);

      methods.forEach((method) => {
        this.addMethodsToApiResource(
          addedResource,
          method,
          userResourceAuthorizer,
          baseFunction
        );
      });
    });
  }

  private addMethodsToApiResource(
    resource: gateway.Resource,
    methodName: string,
    userResourceAuthorizer: gateway.CfnAuthorizer,
    baseFunction: lambda.Function
  ): void {
    resource.addMethod(
      methodName,
      new gateway.LambdaIntegration(baseFunction),
      {
        authorizationType: gateway.AuthorizationType.COGNITO,
        authorizer: {
          authorizerId: userResourceAuthorizer.ref,
        },
      }
    );
  }
}
