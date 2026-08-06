---
name: Choosing Azure Authentication for AppsIndie Backends
id: note-b0be2ac8606947a1840e0d187e52506e
author: user
scope: When choosing Azure authentication for AppsIndie backends connecting to Azure services (Blob Storage, Event Grid, Service Bus, databases, etc.)
---

<!-- id: note-b0be2ac8606947a1840e0d187e52506e | name: Choosing Azure Authentication for AppsIndie Backends | author: user | scope: When choosing Azure authentication for AppsIndie backends connecting to Azure services (Blob Storage, Event Grid, Service Bus, databases, etc.) -->

# Choosing Azure Authentication for AppsIndie Backends

Prefer managed identity when the full chain — SDK support, Terraform/App Service provisioning, and role assignment — is straightforward. Fall back to connection strings / per-DB users when managed identity is hard to implement or the service/SDK does not support it.

- Use managed identity for Azure PaaS services that support it (Storage Blob, Event Grid, Service Bus, Azure Container Apps → Storage) and provision the role assignment through Terraform when the deployment identity has Microsoft.Authorization/roleAssignments/write.
- For databases (e.g., PostgreSQL) or other services where managed identity setup is non-trivial, use a connection string with a dedicated per-DB user and store credentials in Azure Key Vault / Container App secrets, never in source control.
- When the deployment identity cannot assign RBAC and no pre-existing managed identity is available, do not silently fall back to a long-lived secret. Report the exact role, principal ID, and scope to the product owner for manual assignment, and keep the documented fallback (e.g., connection string / per-DB user) active only until the role is confirmed.
- The role-assignment handoff should include a ready-to-run Azure CLI snippet and the specific `az role assignment create` parameters so the owner can execute it without guessing.
- Only fall back to connection strings, account keys, or SAS tokens when:
  - the SDK or service does not support managed identity, or
  - role assignment cannot be provisioned in the target environment and the product owner has approved the exception.
- When a fallback is required:
  - store secrets in Azure Key Vault or as Container App / App Service secrets,
  - inject them at runtime via environment variables or secret references,
  - never commit secrets to source control.
- Document any exception in an ADR with the context, rejected options, and flip conditions to move to managed identity once the blocker is removed.
