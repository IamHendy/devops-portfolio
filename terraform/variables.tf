variable "droplet_ip" {
  description = "Public IP of the DigitalOcean droplet"
  type        = string
  default     = "159.89.87.190"
}

variable "app_name" {
  description = "Application name"
  type        = string
  default     = "users-api"
}

variable "app_namespace" {
  description = "Kubernetes namespace for the app"
  type        = string
  default     = "production"
}

variable "app_version" {
  description = "Application version"
  type        = string
  default     = "1.0.0"
}

variable "domain" {
  description = "Domain name for the app"
  type        = string
  default     = "devopsportfolio.strangled.net"
}