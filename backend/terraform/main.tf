terraform {
  required_version = ">= 1.0.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

# Variables
variable "resource_group_name" {
  type    = string
  default = "fcta-aks-rg"
}

variable "location" {
  type    = string
  default = "australiasoutheast"
}

# Create a Resource Group
resource "azurerm_resource_group" "rg" {
  name     = var.resource_group_name
  location = var.location
}

# Create AKS Cluster
resource "azurerm_kubernetes_cluster" "aks" {
  name                = "fcta-innovation-aks-cluster"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  dns_prefix          = "fcta"

  default_node_pool {
    name       = "default"
    node_count = 1  # Just 1 node for cost-efficiency
    vm_size    = "Standard_B2s" # a small, cheap VM
  }

  identity {
    type = "SystemAssigned"
  }

  # Kubernetes version might need updating over time, check Azure AKS versions.
  kubernetes_version = "1.30.0"
}

# Outputs
output "kube_config" {
  value = azurerm_kubernetes_cluster.aks.kube_config_raw
  sensitive = true
}

