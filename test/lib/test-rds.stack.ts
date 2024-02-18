import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

export class TestRdsStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const vpc = ec2.Vpc.fromVpcAttributes(this, 'TestVpc', {
      vpcId: 'vpc-0f40e7633a46d2981',
      availabilityZones: ['eu-central-1a', 'eu-central-1b', 'eu-central-1c'],
      publicSubnetIds: [
        'subnet-0a27cb5f585a256b5',
        'subnet-0cc165924c3933dd5',
        'subnet-0f61af81511bd7873',
      ],
    });
    const vpcSubnets = vpc.selectSubnets({
      subnetType: ec2.SubnetType.PUBLIC,
    });

    const securityGroup = new ec2.SecurityGroup(this, 'TestRdsSg', {
      vpc,
      securityGroupName: 'test-rds-sg',
    });
    const subnetGroup = new rds.SubnetGroup(this, `TestRdsSubnetGroup`, {
      vpc: vpc,
      subnetGroupName: 'test-rds-subnet-group',
      vpcSubnets,
      description: 'Test Rds Subnet group',
    });

    const dbUserName = 'test_user';
    const secret = new secretmanager.Secret(this, 'TestRdsSecret', {
      secretName: '/database/test',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          username: dbUserName,
        }),
        excludePunctuation: true,
        includeSpace: false,
        generateStringKey: 'password',
      },
    });
    const db = new rds.DatabaseInstance(this, 'TestRdsInstance', {
      engine: rds.DatabaseInstanceEngine.mysql({
        version: rds.MysqlEngineVersion.VER_8_0_31,
      }),
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        ec2.InstanceSize.MICRO
      ),
      vpc,
      allocatedStorage: 20,
      autoMinorVersionUpgrade: true,
      availabilityZone: 'eu-central-1a',
      instanceIdentifier: 'test-rds',
      port: 3306,
      vpcSubnets,
      subnetGroup,
      credentials: rds.Credentials.fromSecret(secret),
      securityGroups: [securityGroup],
      publiclyAccessible: true,
    });

    new CfnOutput(this, 'TestRdsSecurityGroupId', {
      value: securityGroup.securityGroupId,
      exportName: 'TestRdsSecurityGroupId',
      description: 'Test RDS SG ID',
    });
    new CfnOutput(this, 'TestRdsEndpointAddress', {
      value: db.dbInstanceEndpointAddress,
      exportName: 'TestRdsEndpointAddress',
      description: 'Test RDS Endpoint Address',
    });
    new CfnOutput(this, 'TestRdsEndpointPort', {
      value: db.dbInstanceEndpointPort,
      exportName: 'TestRdsEndpointPort',
      description: 'Test RDS Endpoint Port',
    });
    new CfnOutput(this, 'TestRdsInstanceName', {
      value: db.instanceIdentifier,
      exportName: 'TestRdsInstanceName',
      description: 'Test RDS Instance Name',
    });
    new CfnOutput(this, 'TestRdsDbUser', {
      value: dbUserName,
      exportName: 'TestRdsDbUser',
      description: 'Test RDS DB User',
    });
    new CfnOutput(this, 'TestRdsDbPassword', {
      value: secret.secretValueFromJson('password').toString(),
      exportName: 'TestRdsDbPassword',
      description: 'Test RDS DB Password',
    });
  }
}
