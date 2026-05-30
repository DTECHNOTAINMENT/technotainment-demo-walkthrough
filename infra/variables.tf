variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "eu-west-2" # London — UK + EU launch (docs/DECISIONS.md §2)
}

variable "environment" {
  description = "Deployment environment (dev | staging | prod)"
  type        = string
  default     = "dev"
}

variable "app_image_tag" {
  description = "Container image tag to deploy (pushed to ECR by CI)"
  type        = string
  default     = "latest"
}

variable "db_instance_class" {
  description = "RDS instance class — scale from single-AZ dev to Multi-AZ prod"
  type        = string
  default     = "db.t4g.medium"
}

variable "multi_az" {
  description = "Run RDS + cache Multi-AZ (true for prod)"
  type        = bool
  default     = false
}
