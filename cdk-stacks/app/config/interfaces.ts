export interface AppLambda {
  codeDirectory: string;
  logLevel: string;
  duration?: number;
  memorySize?: number;
}

// Image Processing Lambdas are triggered from SQS Queue, therefore they need batchSize and maxConcurrency props
export interface ImageLambda extends AppLambda {
  batchSize: number;
  maxConcurrency: number;
  duration?: number;
  memorySize?: number;
}

export interface ImageGeotaggerLambda extends AppLambda {
  imageProcessorSecretName: string;
  imageProcessorSecretKey: string;
}
