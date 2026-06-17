terraform {
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.0"
    }
  }
}

provider "kubernetes" {
  config_path = "/etc/rancher/k3s/k3s.yaml"
}

provider "helm" {
  kubernetes {
    config_path = "/etc/rancher/k3s/k3s.yaml"
  }
}

resource "kubernetes_namespace" "production" {
  metadata {
    name = var.app_namespace
    labels = {
      environment = "production"
      managed-by  = "terraform"
    }
  }
}

resource "helm_release" "users_api" {
  name      = var.app_name
  chart     = "${path.module}/helm/users-api"
  namespace = kubernetes_namespace.production.metadata[0].name

  set {
    name  = "image.tag"
    value = "latest"
  }

  set {
    name  = "domain"
    value = var.domain
  }

  depends_on = [kubernetes_namespace.production]
}