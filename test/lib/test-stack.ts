import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { RDSMySQLBackupLambda } from '../../lib/index';

export interface TestStackProps extends cdk.StackProps {
  readonly vpcId: string;
  readonly vpcSubnetIds: string[];
  readonly rdsInstanceName: string;
  readonly rdsInstanceEndpointAddress: string;
  readonly rdsInstancePort: number;
  readonly rdsSecurityGroupId: string;
  readonly dbUser: string;
  readonly dbPassword: string;
}

export class TestStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: TestStackProps) {
    super(scope, id, props);

    const vpc = ec2.Vpc.fromVpcAttributes(this, 'TestVpc', {
      vpcId: props.vpcId,
      availabilityZones: ['eu-central-1a', 'eu-central-1b', 'eu-central-1c'],
      publicSubnetIds: props.vpcSubnetIds,
    });
    const vpcSubnets = vpc.selectSubnets({
      subnetType: ec2.SubnetType.PUBLIC,
    });

    new RDSMySQLBackupLambda(this, 'RDSMySQLBackupLambda', {
      rdsInstanceName: props.rdsInstanceName,
      rdsInstanceEndpointAddress: props.rdsInstanceEndpointAddress,
      rdsSecurityGroupId: props.rdsSecurityGroupId,
      dbName: 'test_rds',
      dbUser: props.dbUser,
      dbPassword: props.dbPassword,
      rdsVpc: vpc,
      rdsVpcSubnets: vpcSubnets,
    });
  }
}
