import {
  DescribeRouteTablesCommand,
  DescribeVpcEndpointsCommand,
  EC2Client,
} from '@aws-sdk/client-ec2';
import { CfnResource, Duration, ResourceProps } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as events from 'aws-cdk-lib/aws-events';
import * as eventTargets from 'aws-cdk-lib/aws-events-targets';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { join } from 'path';

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

export class RDSMySQLBackupLambda extends Construct {
  /**
   * The lambda function to backup the RDS instance.
   */
  public readonly lambdaFunction: lambda.Function;

  /**
   * The S3 bucket created to store the RDS backups.
   */
  public readonly s3Bucket: s3.Bucket;

  constructor(scope: Construct, id: string, props: RDSMySQLBackupLambdaProps) {
    super(scope, id);

    this.s3Bucket = this._createBucket(props);

    const functionRole = this._createFunctionRole(props, this.s3Bucket);
    const functionSecurityGroup = this._createFunctionSecurityGroup(props);
    this.lambdaFunction = this._createLambdaFunction({
      props,
      bucket: this.s3Bucket,
      role: functionRole,
      securityGroup: functionSecurityGroup,
    });

    this._updateRdsInstanceSecurityGroup(props, functionSecurityGroup);
    this._addScheduledEventRule(props, this.lambdaFunction);

    this._createS3VpcEndpoint(props);
  }

  private _createBucket(props: RDSMySQLBackupLambdaProps): s3.Bucket {
    const bucket = new s3.Bucket(this, 'RDSBackupBucket', {
      bucketName: props.s3BucketName ?? `${props.rdsInstanceName}-rds-backup`,
      blockPublicAccess: {
        blockPublicAcls: true,
        blockPublicPolicy: true,
        ignorePublicAcls: true,
        restrictPublicBuckets: true,
      },
      encryption: s3.BucketEncryption.S3_MANAGED,
    });

    return bucket;
  }

  private _createFunctionRole(
    props: RDSMySQLBackupLambdaProps,
    bucket: s3.Bucket
  ): iam.Role {
    const role = new iam.Role(this, 'RdsBackupLambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      roleName: `${props.rdsInstanceName}-rds-backup-lambda-role`,
    });

    role.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'ec2:DescribeNetworkInterfaces',
          'ec2:CreateNetworkInterface',
          'ec2:DeleteNetworkInterface',
          'ec2:DescribeInstances',
          'ec2:AttachNetworkInterface',
        ],
        resources: ['*'],
      })
    );

    role.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'logs:CreateLogGroup',
          'logs:CreateLogStream',
          'logs:PutLogEvents',
        ],
        resources: ['*'],
      })
    );

    role.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        resources: [bucket.bucketArn, bucket.arnForObjects('*')],
        actions: ['s3:PutObject'],
      })
    );

    return role;
  }

  private _createFunctionSecurityGroup(
    props: RDSMySQLBackupLambdaProps
  ): ec2.SecurityGroup {
    const securityGroup = new ec2.SecurityGroup(
      this,
      'RdsBackupLambdaSecurityGroup',
      {
        vpc: props.rdsVpc,
        securityGroupName: `${props.rdsInstanceName}-rds-backup-lambda-security-group`,
      }
    );

    return securityGroup;
  }

  private _createLambdaFunction({
    props,
    bucket,
    role,
    securityGroup,
  }: {
    readonly props: RDSMySQLBackupLambdaProps;
    readonly bucket: s3.Bucket;
    readonly role: iam.Role;
    readonly securityGroup: ec2.SecurityGroup;
  }): lambda.Function {
    const lambdaFunction = new lambda.Function(
      this,
      'RdsBackupLambdaFunction',
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        architecture: lambda.Architecture.X86_64,
        code: lambda.Code.fromAsset(join(__dirname, 'lambda.zip')),
        handler: 'dist/index.handler',
        functionName:
          props.lambdaFunctionName ??
          `${props.rdsInstanceName}-rds-backup-lambda`,
        environment: {
          DB_HOST: props.rdsInstanceEndpointAddress,
          DB_USER: props.dbUser,
          DB_PASSWORD: props.dbPassword,
          DB_NAME: props.dbName,
          DB_PORT: (props.rdsInstancePort ?? 3306).toString(),
          BUCKET_NAME: bucket.bucketName,
          BUCKET_REGION: process.env.CDK_DEFAULT_REGION as string,
        },
        timeout: props.lambdaTimeout ?? Duration.minutes(5),
        retryAttempts: 0,
        role,
        securityGroups: [securityGroup],
        vpc: props.rdsVpc,
        vpcSubnets: {
          subnets: props.rdsVpcSubnets.subnets,
        },
        ...(props.rdsVpcSubnets.hasPublic && { allowPublicSubnet: true }),
      }
    );

    return lambdaFunction;
  }

  private _updateRdsInstanceSecurityGroup(
    props: RDSMySQLBackupLambdaProps,
    securityGroup: ec2.SecurityGroup
  ): void {
    const rdsSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(
      this,
      'RdsSecurityGroup',
      props.rdsSecurityGroupId
    );

    rdsSecurityGroup.addIngressRule(
      securityGroup,
      ec2.Port.tcp(props.rdsInstancePort ?? 3306),
      'Allow access from DB backup function'
    );
  }

  private _addScheduledEventRule(
    props: RDSMySQLBackupLambdaProps,
    lambdaFunction: lambda.Function
  ): void {
    const scheduledEventRule = new events.Rule(
      this,
      'RdsBackupLambdaScheduledEventRule',
      {
        ruleName: `${props.rdsInstanceName}-rds-backup-lambda-scheduled-event-rule`,
        schedule:
          props.scheduleRule ??
          events.Schedule.cron({ minute: '0', hour: '0' }),
      }
    );

    scheduledEventRule.addTarget(
      new eventTargets.LambdaFunction(lambdaFunction)
    );
  }

  private async _hasS3VpcEndpoint(
    props: RDSMySQLBackupLambdaProps,
    ec2Client: EC2Client
  ): Promise<boolean> {
    const command = new DescribeVpcEndpointsCommand({
      Filters: [
        {
          Name: 'vpc-id',
          Values: [props.rdsVpc.vpcId],
        },
        {
          Name: 'vpc-endpoint-type',
          Values: ['Gateway'],
        },
        {
          Name: 'service-name',
          Values: [
            `com.amazonaws.${process.env.CDK_DEFAULT_REGION as string}.s3`,
          ],
        },
      ],
    });
    const response = await ec2Client.send(command);
    const vpcEndpointIds: string[] = [];

    if (response.VpcEndpoints) {
      response.VpcEndpoints.forEach((vpcEndpoint) => {
        if (vpcEndpoint.VpcEndpointId) {
          vpcEndpointIds.push(vpcEndpoint.VpcEndpointId);
        }
      });
    }

    return vpcEndpointIds.length > 0;
  }

  private async _fetchRouteTableIds(
    props: RDSMySQLBackupLambdaProps,
    ec2Client: EC2Client
  ): Promise<string[]> {
    const command = new DescribeRouteTablesCommand({
      Filters: [
        {
          Name: 'vpc-id',
          Values: [props.rdsVpc.vpcId],
        },
        {
          Name: 'association.subnet-id',
          Values: props.rdsVpcSubnets.subnetIds,
        },
      ],
    });

    const response = await ec2Client.send(command);
    const routeTableIds: string[] = [];

    if (response.RouteTables) {
      response.RouteTables.forEach((routeTable) => {
        if (routeTable.RouteTableId) {
          routeTableIds.push(routeTable.RouteTableId);
        }
      });
    }

    return routeTableIds;
  }

  private async _createS3VpcEndpoint(
    props: RDSMySQLBackupLambdaProps
  ): Promise<void> {
    const ec2Client = new EC2Client({
      region: process.env.CDK_DEFAULT_REGION as string,
    });

    const hasEndpoint = await this._hasS3VpcEndpoint(props, ec2Client);
    if (hasEndpoint === false) {
      const routeTableIds = await this._fetchRouteTableIds(props, ec2Client);

      new CfnResource(this, 'S3GatewayEndpointResource', {
        type: 'AWS::EC2::VPCEndpoint',
        properties: {
          ServiceName: 'com.amazonaws.eu-central-1.s3',
          VpcId: props.rdsVpc.vpcId,
          RouteTableIds: routeTableIds,
          PolicyDocument: {
            Statement: [
              {
                Action: '*',
                Effect: 'Allow',
                Resource: '*',
                Principal: '*',
              },
            ],
          },
        },
      });
    }
  }
}
