# Photo Maps App

## Setup

To begin working on this project, the following are required

- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) installed (Version `2.9.9` used for this project)
- [Node](https://nodejs.org/en/download/) installed (Version `16.17.0` used for this project)
- [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) installed (Version `8.15.0` used for this project)
- (OPTIONAL) It may also help to install [nvm](https://www.freecodecamp.org/news/node-version-manager-nvm-install-guide/)
- Once `node` and `npm` are installed, the CDK CLI can be installed with the following command `npm install -g aws-cdk` (Version `2.59.0` used for this project)
- Once the AWS CLI has been configured with some type of account credentials, and the CDK CLI has been installed, run the following command to bootstrap the target AWS Account (Account linked to CLI credentials), `cdk bootstrap`. [Bootstrap Documentation](https://docs.aws.amazon.com/cdk/v2/guide/bootstrapping.html) contains information on how to bootstrap multi-account environments.

## Troublesome Areas

These contain some references that were used to handle troublesome parts of this project

### Use CDK to set up Github Actions OIDC Provider

- https://towardsthecloud.com/aws-cdk-openid-connect-github (Note the Repo link at the bottom)

### Set up Cognito with User/Password Auth Flow

- http://buraktas.com/create-cognito-user-pool-aws-cdk/

### Setup Google OAuth Consent Screen (Cognito with Google Social Login)

- https://aws-cdk.com/cognito-google
- https://github.com/awesome-cdk/cognito-google-federation-example
- https://sst.dev/examples/how-to-add-google-login-to-your-cognito-user-pool.html
