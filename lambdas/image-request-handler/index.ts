import { Handler } from "aws-lambda";

export const handler: Handler = async (event, context) => {
  const request = event.Records[0].cf.request;

  console.log(event);
  return request;
};
