terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.16"
    }
  }

  required_version = ">= 1.2.0"
}

provider "aws" {
  region = var.aws_region
}

# S3
resource "aws_s3_bucket" "data_blob_storage" {
  bucket = "data-blob-storage"

  tags = {
    Name = "Data Blob Storage"
  }
}

resource "aws_s3_bucket_policy" "allow_access_from_another_account" {
  bucket = aws_s3_bucket.data_blob_storage.id
  policy = data.aws_iam_policy_document.allow_access_from_another_account.json
}

data "aws_iam_policy_document" "allow_access_from_another_account" {
  statement {
    principals {
      type        = "AWS"
      identifiers = ["arn:aws:iam::568594946034:user/s3-user"]
    }

    effect = "Allow"

    actions = [
      "s3:GetObject",
      "s3:ListBucket",
      "s3:PutObject",
      "s3:DeleteObject",
    ]

    resources = [
      aws_s3_bucket.data_blob_storage.arn,
      "${aws_s3_bucket.data_blob_storage.arn}/*",
    ]
  }
}

# ECR
resource "aws_ecr_repository" "app_repository" {
  name = "my-nodejs-app"
}

# ECS
resource "aws_ecs_cluster" "app_cluster" {
  name = "my-ecs-cluster"
}

resource "aws_ecs_task_definition" "app_task" {
  family                   = var.app_name
  container_definitions    = jsonencode([
    {
      name  = var.app_name
      image = "${aws_ecr_repository.app_repository.repository_url}:latest"
      portMappings = [
        {
          containerPort = 3000
          hostPort      = 0
        }
      ]
    }
  ])
}

resource "aws_ecs_service" "app_service" {
  depends_on = [aws_ecs_task_definition.app_task]

  name            = "${var.app_name}-service"
  cluster         = aws_ecs_cluster.app_cluster.id
  task_definition = aws_ecs_task_definition.app_task.arn
  desired_count   = 1

  load_balancer {
    target_group_arn = aws_lb_target_group.app_target_group.arn
    container_name   = var.app_name
    container_port   = 3000
  }

  network_configuration {
    subnets          = ["subnet-abc123", "subnet-def456"]  # Specify your subnets
    security_groups  = ["sg-123456"]                       # Specify your security groups
    assign_public_ip = true
  }
}

# Load Balancer
resource "aws_lb" "app_lb" {
  name               = "${var.app_name}-lb"
  internal           = false
  load_balancer_type = "application"
  subnets            = ["subnet-abc123", "subnet-def456"]
  security_groups    = ["sg-123456"]
}

resource "aws_lb_target_group" "app_target_group" {
  name     = "${var.app_name}-tg"
  port     = 3000
  protocol = "HTTP"
  vpc_id   = "vpc-123456"
}

resource "aws_lb_listener" "app_lb_listener" {
  load_balancer_arn = aws_lb.app_lb.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app_target_group.arn
  }
}


