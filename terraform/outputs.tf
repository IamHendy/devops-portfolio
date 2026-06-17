output "namespace" {
  description = "Kubernetes namespace"
  value       = kubernetes_namespace.production.metadata[0].name
}

output "app_name" {
  description = "Application name"
  value       = var.app_name
}

output "domain" {
  description = "Live domain"
  value       = "http://${var.domain}"
}

