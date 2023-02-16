import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";
import { IConfig } from "../../../config";
import { PythonLambda, NodeLambda } from "../../../constructs/lambda-functions";
import { createPathName } from "../../../utils/utils";

interface ImageProcessorLambdasStackProps extends cdk.NestedStackProps {
  assetBucket: s3.IBucket;
  Config: IConfig;
}

export class ImageProcessorLambdasStack extends cdk.NestedStack {
  imageGeotaggerLambda: PythonLambda;
  imageLabelFilterLambda: PythonLambda;
  appsyncMessengerLambda: NodeLambda;
  constructor(
    scope: Construct,
    id: string,
    props: ImageProcessorLambdasStackProps
  ) {
    super(scope, id, props);

    const { assetBucket, Config } = props;

    const geoTaggerSecrets = secretsmanager.Secret.fromSecretNameV2(
      this,
      "Secret",
      Config.pythonLambdas.imageGeotagger.imageProcessorSecretName
    );

    const imageGeotagger = this.createImageGeotaggerLambda(Config);

    assetBucket.grantRead(imageGeotagger.fnRole);
    geoTaggerSecrets.grantRead(imageGeotagger.fnRole);

    const imageLabelFilter = this.createImageLabelFilterLambda(Config);

    const appsyncSecrets = secretsmanager.Secret.fromSecretNameV2(
      this,
      "AppSyncSecret",
      Config.nodeLambdas.appsyncMessenger.apiKeySecretName
    );
    const appsyncMessenger = this.createAppsyncMessengerLambda(Config);
    appsyncSecrets.grantRead(appsyncMessenger.function);

    this.imageGeotaggerLambda = imageGeotagger;
    this.imageLabelFilterLambda = imageLabelFilter;
    this.appsyncMessengerLambda = appsyncMessenger;
  }

  private createImageGeotaggerLambda(Config: IConfig): PythonLambda {
    return new PythonLambda(this, "GeotaggerLambda", {
      pathName: createPathName(
        Config.environment.basePath,
        Config.pythonLambdas.imageGeotagger.codeDirectory
      ),
      duration: Config.pythonLambdas.imageGeotagger.duration,
      memorySize: Config.pythonLambdas.imageGeotagger.memorySize,
      environment: {
        IMAGE_PROCESSOR_SECRET_NAME:
          Config.pythonLambdas.imageGeotagger.imageProcessorSecretName,
        IMAGE_PROCESSOR_SECRET_KEY:
          Config.pythonLambdas.imageGeotagger.imageProcessorSecretKey,
        LOG_LEVEL: Config.pythonLambdas.imageGeotagger.logLevel,
        POWERTOOLS_SERVICE_NAME:
          Config.pythonLambdas.imageGeotagger.codeDirectory,
      },
      lambdaBuildCommands: Config.pythonLambdas.buildCommands,
    });
  }

  private createImageLabelFilterLambda(Config: IConfig): PythonLambda {
    return new PythonLambda(this, "ImageLabelFilterLambda", {
      pathName: createPathName(
        Config.environment.basePath,
        Config.pythonLambdas.imageLabelFilter.codeDirectory
      ),
      environment: {
        LOG_LEVEL: Config.pythonLambdas.imageLabelFilter.logLevel,
      },
      lambdaBuildCommands: Config.pythonLambdas.buildCommands,
    });
  }

  private createAppsyncMessengerLambda(Config: IConfig): NodeLambda {
    return new NodeLambda(this, "AppSyncMutatorLambda", {
      pathName: createPathName(
        Config.environment.basePath,
        Config.nodeLambdas.appsyncMessenger.codeDirectory
      ),
      environment: {
        APPSYNC_API_URL: Config.nodeLambdas.appsyncMessenger.appSyncApiUrl,
        APPSYNC_AUTH_TYPE: Config.nodeLambdas.appsyncMessenger.appSyncAuthType,
        SECRET_NAME: Config.nodeLambdas.appsyncMessenger.apiKeySecretName,
        SECRET_KEY: Config.nodeLambdas.appsyncMessenger.apiKeySecretKey,
      },
    });
  }
}
