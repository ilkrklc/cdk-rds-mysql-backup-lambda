package cdkrdsmysqlbackuplambda

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/aws-cdk-go/awscdk/v2/awsec2"
	"github.com/aws/aws-cdk-go/awscdk/v2/awsevents"
)

// Properties for the RDSMySQLBackupLambda construct.
type RDSMySQLBackupLambdaProps struct {
	// The AWS account ID this resource belongs to.
	// Default: - the resource is in the same account as the stack it belongs to.
	//
	Account *string `field:"optional" json:"account" yaml:"account"`
	// ARN to deduce region and account from.
	//
	// The ARN is parsed and the account and region are taken from the ARN.
	// This should be used for imported resources.
	//
	// Cannot be supplied together with either `account` or `region`.
	// Default: - take environment from `account`, `region` parameters, or use Stack environment.
	//
	EnvironmentFromArn *string `field:"optional" json:"environmentFromArn" yaml:"environmentFromArn"`
	// The value passed in by users to the physical name prop of the resource.
	//
	// - `undefined` implies that a physical name will be allocated by
	//   CloudFormation during deployment.
	// - a concrete value implies a specific physical name
	// - `PhysicalName.GENERATE_IF_NEEDED` is a marker that indicates that a physical will only be generated
	//   by the CDK if it is needed for cross-environment references. Otherwise, it will be allocated by CloudFormation.
	// Default: - The physical name will be allocated by CloudFormation at deployment time.
	//
	PhysicalName *string `field:"optional" json:"physicalName" yaml:"physicalName"`
	// The AWS region this resource belongs to.
	// Default: - the resource is in the same region as the stack it belongs to.
	//
	Region *string `field:"optional" json:"region" yaml:"region"`
	// Name of the database to backup.
	DbName *string `field:"required" json:"dbName" yaml:"dbName"`
	// Password to connect to the RDS instance.
	DbPassword *string `field:"required" json:"dbPassword" yaml:"dbPassword"`
	// User to connect to the RDS instance.
	DbUser *string `field:"required" json:"dbUser" yaml:"dbUser"`
	// Endpoint address of the RDS instance.
	RdsInstanceEndpointAddress *string `field:"required" json:"rdsInstanceEndpointAddress" yaml:"rdsInstanceEndpointAddress"`
	// Name of RDS instance to backup.
	RdsInstanceName *string `field:"required" json:"rdsInstanceName" yaml:"rdsInstanceName"`
	// Security group ID for the RDS instance.
	RdsSecurityGroupId *string `field:"required" json:"rdsSecurityGroupId" yaml:"rdsSecurityGroupId"`
	// VPC used by the RDS instance.
	RdsVpc awsec2.IVpc `field:"required" json:"rdsVpc" yaml:"rdsVpc"`
	// VPC subnet group used by the RDS instance.
	RdsVpcSubnets *awsec2.SelectedSubnets `field:"required" json:"rdsVpcSubnets" yaml:"rdsVpcSubnets"`
	// Name of the lambda function that will be created.
	// Default: - [db-instance-identifier]-rds-backup-lambda.
	//
	LambdaFunctionName *string `field:"optional" json:"lambdaFunctionName" yaml:"lambdaFunctionName"`
	// Timeout value for the backup lambda function.
	// Default: - 5 minutes.
	//
	LambdaTimeout awscdk.Duration `field:"optional" json:"lambdaTimeout" yaml:"lambdaTimeout"`
	// Port of the RDS instance.
	RdsInstancePort *float64 `field:"optional" json:"rdsInstancePort" yaml:"rdsInstancePort"`
	// Name of the S3 bucket to store the RDS backups.
	// Default: - [db-instance-identifier]-rds-backup.
	//
	S3BucketName *string `field:"optional" json:"s3BucketName" yaml:"s3BucketName"`
	// Schedule for the lambda function to run.
	// Default: - Every day at 00:00 UTC.
	//
	ScheduleRule awsevents.Schedule `field:"optional" json:"scheduleRule" yaml:"scheduleRule"`
}

