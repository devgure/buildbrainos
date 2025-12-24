variable "region" {
  type    = string
  default = "us-east-1"
}

variable "cluster_role_arn" {
  type = string
}

variable "subnet_ids" {
  type = list(string)
}
