interface LambdaProps {
  pathName: string;
  duration?: number;
  memorySize?: number;
  environment?: {
    [key: string]: string;
  };
  retryAttempts?: number;
}

export interface NodeLambdaProps extends LambdaProps {}

export interface PythonLambdaProps extends LambdaProps {
  lambdaBuildCommands: string[];
}
