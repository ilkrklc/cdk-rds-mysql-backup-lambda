#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { TestRdsStack } from '../lib/test-rds.stack';

const app = new cdk.App();
new TestRdsStack(app, 'TestRdsStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
