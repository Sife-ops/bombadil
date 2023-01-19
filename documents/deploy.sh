aws cloudformation deploy \
  --stack-name gateway-logging-permission \
  --template-file cloud-formation.yml \
  --no-fail-on-empty-changeset \
  --capabilities CAPABILITY_NAMED_IAM CAPABILITY_AUTO_EXPAND \
  --region us-east-1
