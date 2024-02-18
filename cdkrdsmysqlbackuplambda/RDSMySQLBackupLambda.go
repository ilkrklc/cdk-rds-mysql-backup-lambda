package cdkrdsmysqlbackuplambda

import (
	_jsii_ "github.com/aws/jsii-runtime-go/runtime"
	_init_ "github.com/ilkrklc/cdk-rds-mysql-backup-lambda/cdkrdsmysqlbackuplambda/jsii"

	"github.com/aws/aws-cdk-go/awscdk/v2/awslambda"
	"github.com/aws/aws-cdk-go/awscdk/v2/awss3"
	"github.com/aws/constructs-go/constructs/v10"
	"github.com/ilkrklc/cdk-rds-mysql-backup-lambda/cdkrdsmysqlbackuplambda/internal"
)

type RDSMySQLBackupLambda interface {
	constructs.Construct
	// The lambda function to backup the RDS instance.
	LambdaFunction() awslambda.Function
	// The tree node.
	Node() constructs.Node
	// The S3 bucket created to store the RDS backups.
	S3Bucket() awss3.Bucket
	// Returns a string representation of this construct.
	ToString() *string
}

// The jsii proxy struct for RDSMySQLBackupLambda
type jsiiProxy_RDSMySQLBackupLambda struct {
	internal.Type__constructsConstruct
}

func (j *jsiiProxy_RDSMySQLBackupLambda) LambdaFunction() awslambda.Function {
	var returns awslambda.Function
	_jsii_.Get(
		j,
		"lambdaFunction",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_RDSMySQLBackupLambda) Node() constructs.Node {
	var returns constructs.Node
	_jsii_.Get(
		j,
		"node",
		&returns,
	)
	return returns
}

func (j *jsiiProxy_RDSMySQLBackupLambda) S3Bucket() awss3.Bucket {
	var returns awss3.Bucket
	_jsii_.Get(
		j,
		"s3Bucket",
		&returns,
	)
	return returns
}


func NewRDSMySQLBackupLambda(scope constructs.Construct, id *string, props *RDSMySQLBackupLambdaProps) RDSMySQLBackupLambda {
	_init_.Initialize()

	if err := validateNewRDSMySQLBackupLambdaParameters(scope, id, props); err != nil {
		panic(err)
	}
	j := jsiiProxy_RDSMySQLBackupLambda{}

	_jsii_.Create(
		"cdk-rds-mysql-backup-lambda.RDSMySQLBackupLambda",
		[]interface{}{scope, id, props},
		&j,
	)

	return &j
}

func NewRDSMySQLBackupLambda_Override(r RDSMySQLBackupLambda, scope constructs.Construct, id *string, props *RDSMySQLBackupLambdaProps) {
	_init_.Initialize()

	_jsii_.Create(
		"cdk-rds-mysql-backup-lambda.RDSMySQLBackupLambda",
		[]interface{}{scope, id, props},
		r,
	)
}

// Checks if `x` is a construct.
//
// Use this method instead of `instanceof` to properly detect `Construct`
// instances, even when the construct library is symlinked.
//
// Explanation: in JavaScript, multiple copies of the `constructs` library on
// disk are seen as independent, completely different libraries. As a
// consequence, the class `Construct` in each copy of the `constructs` library
// is seen as a different class, and an instance of one class will not test as
// `instanceof` the other class. `npm install` will not create installations
// like this, but users may manually symlink construct libraries together or
// use a monorepo tool: in those cases, multiple copies of the `constructs`
// library can be accidentally installed, and `instanceof` will behave
// unpredictably. It is safest to avoid using `instanceof`, and using
// this type-testing method instead.
//
// Returns: true if `x` is an object created from a class which extends `Construct`.
func RDSMySQLBackupLambda_IsConstruct(x interface{}) *bool {
	_init_.Initialize()

	if err := validateRDSMySQLBackupLambda_IsConstructParameters(x); err != nil {
		panic(err)
	}
	var returns *bool

	_jsii_.StaticInvoke(
		"cdk-rds-mysql-backup-lambda.RDSMySQLBackupLambda",
		"isConstruct",
		[]interface{}{x},
		&returns,
	)

	return returns
}

func (r *jsiiProxy_RDSMySQLBackupLambda) ToString() *string {
	var returns *string

	_jsii_.Invoke(
		r,
		"toString",
		nil, // no parameters
		&returns,
	)

	return returns
}

