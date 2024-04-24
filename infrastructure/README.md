# Infrastructure

This directory contains the infrastructure code for the project. It uses Terraform to provision resources on AWS.

## AWS Resources

The infrastructure includes the following AWS resources:

- S3 Bucket: Used for storing screenshots and camera captures. The bucket name is `data-blob-storage`.
- IAM Policy: Allows access to the S3 bucket from another AWS account.
- ECR Repository: Stores Docker images for the application. The repository name is `my-nodejs-app`.
- ECS Cluster: Runs the application. The cluster name is `my-ecs-cluster`.
- ECS Task Definition and Service: Defines and runs the application task in the ECS cluster.
- Load Balancer: Balances the load to the application. The load balancer name is derived from the application name.

## Terraform

Terraform is used to manage the infrastructure. The required Terraform version is `>= 1.2.0`.

## Running Terraform

To run Terraform, use the following commands:

```bash
# Initialize Terraform
terraform init

# Plan the changes
terraform plan

# Apply the changes
terraform apply
```
