# RDSMySQLBackupLambda

![GitHub](https://img.shields.io/github/license/ilkrklc/cdk-rds-mysql-backup-lambda) ![npm version](https://img.shields.io/npm/v/cdk-rds-mysql-backup-lambda) [![Maven Central](https://maven-badges.herokuapp.com/maven-central/io.github.ilkrklc/cdk.rds.mysql.backup.lambda/badge.svg)](https://maven-badges.herokuapp.com/maven-central/io.github.ilkrklc/cdk.rds.mysql.backup.lambda) [![NuGet latest version](https://badgen.net/nuget/v/CDK.RDS.MySQL.Backup.Lambda/latest)](https://nuget.org/packages/CDK.RDS.MySQL.Backup.Lambda) [![PyPi version](https://badgen.net/pypi/v/cdk-rds-mysql-backup-lambda/)](https://pypi.org/project/cdk-rds-mysql-backup-lambda) [![Go Reference](https://pkg.go.dev/badge/github.com/ilkrklc/cdk-rds-mysql-backup-lambda/cdkrdsmysqlbackuplambda.svg)](https://pkg.go.dev/github.com/ilkrklc/cdk-rds-mysql-backup-lambda/cdkrdsmysqlbackuplambda)

The `RDSMySQLBackupLambda` is an AWS CDK Construct that provides an automated solution for backing up RDS MySQL databases to an S3 bucket using a Lambda function. It is designed for developers who need a flexible and cost-effective method to back up their RDS MySQL databases outside of the default RDS backup capabilities.

## Table of Contents

- [Features](#features)
- [How It Works](#how-it-works)
- [Installation](#installation)
- [Usage](#usage)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [Pull Request Guidelines](#pull-request-guidelines)
- [License](#license)

## Features

- Automated backups of RDS MySQL databases.
- Backup scheduling using a cron expression.
- Backups stored securely in an S3 bucket with encryption.
- Customizable Lambda function name, timeout, and S3 bucket name.
- Built-in VPC and security group configurations for secure access to RDS instances.

## How It Works

The RDSMySQLBackupLambda AWS CDK Construct automates the process of backing up RDS MySQL databases to S3, leveraging AWS Lambda and other AWS services. Here’s an overview of its operation:

### Architecture and Flow:

**1. Lambda Function:**

- A Lambda function is the core component that performs the database backup. It's triggered based on the specified schedule (defaulting to daily at 00:00 UTC).
- The function connects to the specified RDS MySQL database instance using the provided credentials and performs a mysqldump.

**2. VPC and Subnet Configuration:**

- The Lambda function is deployed within the same VPC and subnet group as the RDS instance. This ensures a secure and direct connection to the RDS instance, as typically, RDS instances are placed in private subnets without direct internet access.

**3. Security Group Settings:**

- The security group of the Lambda function is configured to allow outbound connections to the RDS instance on the specified port (default 3306 for MySQL).
- The RDS instance's security group is updated to allow inbound connections from the Lambda function's security group.

**4. S3 Bucket for Backup Storage:**

- An S3 bucket is created and configured with server-side encryption (SSE-S3) for secure storage of the backup files.

**5. S3 VPC Endpoint:**

- To address scenarios where the RDS instance and Lambda function reside in a subnet without internet access, the construct utilizes an S3 VPC endpoint.
- This endpoint provides private connectivity to S3, allowing the Lambda function to upload backup files to the S3 bucket without needing internet access.

**6. Backup Process:**

- When triggered, the Lambda function initiates a backup of the specified database, generating a dump file.
- The dump file is then securely uploaded to the S3 bucket via the S3 VPC endpoint.

## Installation

To install `RDSMySQLBackupLambda` construct library using npm, run the following command:

```bash
npm i cdk-rds-mysql-backup-lambda
```

## Usage

To initialize the `RDSMySQLBackupLambda` construct you can use the following code:

```typescript
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as events from 'aws-cdk-lib/aws-events';
import { Construct } from 'constructs';
import { RDSMySQLBackupLambda } from 'cdk-rds-mysql-backup-lambda';

export class TestStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: TestStackProps) {
    super(scope, id, props);

    // Get VPC and Subnets where the RDS instance is located
    const vpc = ec2.Vpc.fromVpcAttributes(this, 'TestVpc', {
      vpcId: props.vpcId,
      availabilityZones: ['eu-central-1a', 'eu-central-1b', 'eu-central-1c'],
      publicSubnetIds: props.vpcSubnetIds,
    });
    const vpcSubnets = vpc.selectSubnets({
      subnetType: ec2.SubnetType.PUBLIC,
    });

    const mysqlBackup = new RDSMySQLBackupLambda(this, 'RDSMySQLBackupLambda', {
      rdsVpc: vpc,
      rdsVpcSubnets: vpcSubnets,
      rdsInstanceName: 'rdsInstanceName',
      rdsInstancePort: 3306, // optional
      rdsInstanceEndpointAddress: 'rdsInstanceEndpointAddress',
      rdsSecurityGroupId: 'rdsSecurityGroupId',
      dbName: 'db_name',
      dbUser: 'user',
      dbPassword: 'pass',
      lambdaFunctionName: 'RDSMySQLBackupLambdaFunction', // optional
      lambdaFunctionTimeout: cdk.Duration.minutes(15), // optional
      s3BucketName: 'rds-mysql-backups', // optional
      backupSchedule: events.Schedule.cron({ hour: '0', minute: '0' }), // optional
    });

    // exported properties
    console.log(mysqlBackup.s3Bucket); // S3 bucket where the backups are stored
    console.log(mysqlBackup.lambdaFunction); // Lambda function that backs up the RDS MySQL database
  }
}
```

## Documentation

To initialize the `RDSMySQLBackupLambda` construct you can use the following props:

```typescript
/**
 * Properties for the RDSMySQLBackupLambda construct.
 */
export interface RDSMySQLBackupLambdaProps extends ResourceProps {
  /**
   * VPC used by the RDS instance.
   */
  readonly rdsVpc: ec2.IVpc;

  /**
   * VPC subnet group used by the RDS instance.
   */
  readonly rdsVpcSubnets: ec2.SelectedSubnets;

  /**
   * Name of RDS instance to backup.
   */
  readonly rdsInstanceName: string;

  /**
   * Endpoint address of the RDS instance.
   */
  readonly rdsInstanceEndpointAddress: string;

  /**
   * Port of the RDS instance.
   */
  readonly rdsInstancePort?: number;

  /**
   * Security group ID for the RDS instance.
   */
  readonly rdsSecurityGroupId: string;

  /**
   * User to connect to the RDS instance.
   */
  readonly dbUser: string;

  /**
   * Password to connect to the RDS instance.
   */
  readonly dbPassword: string;

  /**
   * Name of the database to backup.
   */
  readonly dbName: string;

  /**
   * Name of the lambda function that will be created.
   *
   * @default - [db-instance-identifier]-rds-backup-lambda
   */
  readonly lambdaFunctionName?: string;

  /**
   * Timeout value for the backup lambda function.
   *
   * @default - 5 minutes
   */
  readonly lambdaTimeout?: Duration;

  /**
   * Name of the S3 bucket to store the RDS backups.
   *
   * @default - [db-instance-identifier]-rds-backup
   */
  readonly s3BucketName?: string;

  /**
   * Schedule for the lambda function to run.
   *
   * @default - Every day at 00:00 UTC
   */
  readonly scheduleRule?: events.Schedule;
}
```

## Contributing

We welcome contributions! Please review [code of conduct](.github/CODE_OF_CONDUCT.md) and [contributing guide](.github/CONTRIBUTING.md) so that you can understand what actions will and will not be tolerated.

### Pull Request Guidelines

- The `main` branch is just a snapshot of the latest stable release. All development should be done in development branches. **Do not submit PRs against the `main` branch.**
- Work in the `src` folder and **DO NOT** checkin `dist` in the commits.
- It's OK to have multiple small commits as you work on the PR
- If adding a new feature add accompanying test case.
- If fixing bug,
  - Add accompanying test case if applicable.
  - Provide a detailed description of the bug in the PR.
  - If you are resolving an opened issue add issue number in your PR title.

## License

`RDSMySQLBackupLambda` is [MIT licensed](./LICENSE).
