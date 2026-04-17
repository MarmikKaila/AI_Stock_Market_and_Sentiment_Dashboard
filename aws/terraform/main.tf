terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
  }

  # Uncomment for remote state storage (S3 + DynamoDB)
  # backend "s3" {
  #   bucket         = "stock-dashboard-terraform-state"
  #   key            = "aws/terraform.tfstate"
  #   region         = "us-east-1"
  #   encrypt        = true
  #   dynamodb_table = "terraform-locks"
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = var.tags
  }
}

provider "random" {
}

# Data source: Current AWS account
data "aws_caller_identity" "current" {}

# Data source: Current AWS region
data "aws_region" "current" {}

# Local values for consistency
locals {
  app_name_normalized = lower(replace(var.app_name, "_", "-"))
  resource_prefix     = "${local.app_name_normalized}-${var.environment}"
  common_tags = merge(
    var.tags,
    {
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  )
}

output "aws_account_id" {
  value       = data.aws_caller_identity.current.account_id
  description = "AWS Account ID"
}

output "aws_region" {
  value       = data.aws_region.current.name
  description = "AWS Region"
}

output "environment" {
  value       = var.environment
  description = "Environment"
}
