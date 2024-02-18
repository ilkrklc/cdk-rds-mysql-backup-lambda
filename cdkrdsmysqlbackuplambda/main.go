// A flexible AWS CDK construct for scheduled RDS MySQL backups to S3.
package cdkrdsmysqlbackuplambda

import (
	"reflect"

	_jsii_ "github.com/aws/jsii-runtime-go/runtime"
)

func init() {
	_jsii_.RegisterClass(
		"cdk-rds-mysql-backup-lambda.RDSMySQLBackupLambda",
		reflect.TypeOf((*RDSMySQLBackupLambda)(nil)).Elem(),
		[]_jsii_.Member{
			_jsii_.MemberProperty{JsiiProperty: "lambdaFunction", GoGetter: "LambdaFunction"},
			_jsii_.MemberProperty{JsiiProperty: "node", GoGetter: "Node"},
			_jsii_.MemberProperty{JsiiProperty: "s3Bucket", GoGetter: "S3Bucket"},
			_jsii_.MemberMethod{JsiiMethod: "toString", GoMethod: "ToString"},
		},
		func() interface{} {
			j := jsiiProxy_RDSMySQLBackupLambda{}
			_jsii_.InitJsiiProxy(&j.Type__constructsConstruct)
			return &j
		},
	)
	_jsii_.RegisterStruct(
		"cdk-rds-mysql-backup-lambda.RDSMySQLBackupLambdaProps",
		reflect.TypeOf((*RDSMySQLBackupLambdaProps)(nil)).Elem(),
	)
}
