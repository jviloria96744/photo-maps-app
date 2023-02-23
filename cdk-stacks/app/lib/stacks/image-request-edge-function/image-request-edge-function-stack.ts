import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { NodeLambda } from "../../../constructs/lambda-functions";
import { Construct } from "constructs";
import { IConfig } from "../../../config";
import { createPathName } from "../../../utils/utils";

interface ImageRequestEdgeFunctionStackProps extends cdk.StackProps {
  Config: IConfig;
}
export class ImageRequestEdgeFunctionStack extends cdk.Stack {
  edgeFunction: NodeLambda;
  edgeFunctionVersion: lambda.Version;
  constructor(
    scope: Construct,
    id: string,
    props: ImageRequestEdgeFunctionStackProps
  ) {
    super(scope, id, props);

    const { Config } = props;

    const edgeFunction = new NodeLambda(this, "Lambda", {
      pathName: createPathName(
        Config.environment.basePath,
        Config.nodeLambdas.imageRequestEdgeFunction.codeDirectory
      ),
    });

    const edgeFunctionVersion = new lambda.Version(this, "LambdaVersion", {
      lambda: edgeFunction.function,
    });

    this.edgeFunction = edgeFunction;
    this.edgeFunctionVersion = edgeFunctionVersion;
  }
}
