import { Stack, StackProps, Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';

import { execSync } from 'child_process';

export class CdkBundlingLambdaStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const jsLambdaFunction = new lambda.Function(this, 'js-lambda', {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'jsLambda.handler',
      code: lambda.Code.fromAsset('./lambda/js', {
        bundling: {
          image: lambda.Runtime.NODEJS_16_X.bundlingImage,
          command: [],
          local: {
            tryBundle(outputDir: string) {
              try {
                execSync('npm --version');
              } catch {
                return false;
              }
              
              const commands = [
                'cd lambda/js',
                'npm i',
                `cp -a . ${outputDir}`
              ];
              
              execSync(commands.join(' && '));
              return true;
            }
          }
        }
      }),
      memorySize: 1024,
      functionName: 'js-lambda',
      timeout: Duration.seconds(1)
    });

    const pythonLambdaFunction = new lambda.Function(this, 'python-lambda', {
      runtime: lambda.Runtime.PYTHON_3_9,
      handler: 'pyLambda.handler',
      code: lambda.Code.fromAsset('./lambda/python', {
        bundling: {
          image: lambda.Runtime.PYTHON_3_9.bundlingImage,
          command: [],
          local: {
            tryBundle(outputDir: string) {
              try {
                execSync('pip3 --version');
              } catch {
                return false;
              }

              const commands = [
                `cd lambda/python`,
                `pip3 install -r requirements.txt -t ${outputDir}`,
                `cp -a . ${outputDir}`
              ];

              execSync(commands.join(' && '));
              return true;
            }
          }
        }
      }),
      memorySize: 1024,
      functionName: 'python-lambda',
      timeout: Duration.seconds(1)
    });

    

  }
}
