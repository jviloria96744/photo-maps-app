export interface ImageLambda {
  codeDirectory: string;
  batchSize: number;
  maxConcurrency: number;
  duration?: number;
  memorySize?: number;
  logLevel: string;
}

export interface ImageProcessorLambda extends ImageLambda {
  imageProcessorSecretName: string;
  imageProcessorSecretKey: string;
}
