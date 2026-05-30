# Technotainment — AWS infrastructure (skeleton).
# Documents the production target as code per docs/INFRASTRUCTURE.md §4. Modules are stubs
# to be fleshed out at migration time; nothing here is applied during the build.

terraform {
  required_version = ">= 1.6"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # State in S3 with a DynamoDB lock (create these out-of-band before `init`).
  # backend "s3" {
  #   bucket         = "technotainment-tfstate"
  #   key            = "global/terraform.tfstate"
  #   region         = "eu-west-2"
  #   dynamodb_table = "technotainment-tflock"
  #   encrypt        = true
  # }
}

provider "aws" {
  region = var.aws_region
}

# --- modules (to implement at migration time) ---
# module "network" { source = "./modules/network" ... }   # VPC, subnets, ALB
# module "data"    { source = "./modules/data"    ... }    # RDS Aurora, ElastiCache
# module "storage" { source = "./modules/storage" ... }    # S3 + CloudFront
# module "app"     { source = "./modules/app"     ... }    # ECR, ECS Fargate, autoscaling
# module "secrets" { source = "./modules/secrets" ... }    # Secrets Manager + SSM
# module "dns"     { source = "./modules/dns"     ... }    # Route 53 + ACM
