import { Stack } from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as gateway from "aws-cdk-lib/aws-apigateway";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cognito from "aws-cdk-lib/aws-cognito";
import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";
import { PythonLambda, PythonLambdaProps } from "./python-lambda";

export interface LambdaApiProps {
  codeDirectory: string;
  basePath: string;
  dynamoTable: dynamodb.Table;
  assetBucket: s3.Bucket;
  domainName: string;
  cognitoUserPool: cognito.UserPool;
}

export class LambdaApi extends Construct {
  function: lambda.Function;
  api: gateway.RestApi;

  constructor(parent: Stack, name: string, props: LambdaApiProps) {
    super(parent, name);

    const {
      codeDirectory,
      basePath,
      dynamoTable,
      domainName,
      assetBucket,
      cognitoUserPool,
    } = props;

    const lambdaConstructProps: PythonLambdaProps = {
      codeDirectory,
      basePath,
      environment: {
        DDB_TABLE_NAME: dynamoTable.tableName,
        LOG_LEVEL: "INFO",
        POWERTOOLS_SERVICE_NAME: name,
      },
    };
    const lambdaConstruct = new PythonLambda(
      parent,
      name,
      lambdaConstructProps
    );

    dynamoTable.grantReadWriteData(lambdaConstruct.fnRole);
    assetBucket.grantReadWrite(lambdaConstruct.fnRole);

    const zone = route53.HostedZone.fromLookup(this, `${name}-zone`, {
      domainName: domainName,
    });

    const certificate = new acm.DnsValidatedCertificate(
      this,
      `${name}-certificate`,
      {
        domainName: `api.${domainName}`,
        hostedZone: zone,
        region: "us-east-1", // Cloudfront only checks this region for certificates.
      }
    );

    const api = new LambdaRestApi(this, `${name}-lambda-api`, {
      handler: lambdaConstruct.function,
      proxy: false,
      domainName: {
        domainName: domainName,
        certificate,
        endpointType: gateway.EndpointType.REGIONAL,
      },
    });

    const userResourceAuthorizer = new gateway.CfnAuthorizer(
      this,
      `${name}-cfn-auth`,
      {
        restApiId: api.restApiId,
        name: "Anything",
        type: gateway.AuthorizationType.COGNITO,
        identitySource: "method.request.header.Authorization",
        providerArns: [cognitoUserPool.userPoolArn],
      }
    );

    const resources = [
      ["user", "GET"], // Get User Information
      ["user", "POST"], // Create New User
      ["user", "PUT"], // Update User's Information, i.e. preferences
      ["user", "DELETE"], // Delete User's Account
      ["photos", "GET"], // Get All Photos By User
      ["photos", "DELETE"], // Delete photo from user account
      ["photo", "POST"], // Generate pre-signed URL for photo upload
    ];

    resources.forEach(([resourceName, methodName]) => {
      this.addResourceToApi(
        api,
        resourceName,
        methodName,
        userResourceAuthorizer,
        lambdaConstruct.function
      );
    });

    this.function = lambdaConstruct.function;
    this.api = api;
  }

  private addResourceToApi(
    api: gateway.LambdaRestApi,
    resourceName: string,
    methodName: string,
    userResourceAuthorizer: gateway.CfnAuthorizer,
    baseFunction: lambda.Function
  ): void {
    api.root
      .addResource(resourceName)
      .addMethod(methodName, new gateway.LambdaIntegration(baseFunction), {
        authorizationType: gateway.AuthorizationType.COGNITO,
        authorizer: {
          authorizerId: userResourceAuthorizer.ref,
        },
      });
  }
}
