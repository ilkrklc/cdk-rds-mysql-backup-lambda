#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { TestStack } from '../lib/test-stack';
import { fetchStackOutputs } from '../sdk/cloudformation';

async function deploy() {
  const rdsStackOutputs = await fetchStackOutputs('TestRdsStack');
  const vpcStackOutputs = await fetchStackOutputs('PalaventuraVpcStack');

  const app = new cdk.App();
  new TestStack(app, 'TestStack', {
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION,
    },
    vpcId: vpcStackOutputs.PalaventuraVpcId,
    vpcSubnetIds: vpcStackOutputs.PalaventuraVpcPublicSubnetIds.split(','),
    rdsInstanceName: rdsStackOutputs.TestRdsInstanceName,
    rdsInstanceEndpointAddress: rdsStackOutputs.TestRdsEndpointAddress,
    rdsInstancePort: Number(rdsStackOutputs.TestRdsEndpointPort),
    rdsSecurityGroupId: rdsStackOutputs.TestRdsSecurityGroupId,
    dbUser: rdsStackOutputs.TestRdsDbUser,
    dbPassword: rdsStackOutputs.TestRdsDbPassword,
  });
}
deploy();
