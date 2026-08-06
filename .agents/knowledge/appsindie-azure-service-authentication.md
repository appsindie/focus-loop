---
name: Azure Service-to-Service Authentication for AppsIndie Backends
id: note-b4644ede6d8c4f81a4862f71e56b6106
author: user
scope: When building or deploying AppsIndie backends that connect to Azure services (Blob Storage, Event Grid, Service Bus, etc.)
---

<!-- id: note-b4644ede6d8c4f81a4862f71e56b6106 | name: Azure Service-to-Service Authentication for AppsIndie Backends | author: user | scope: When building or deploying AppsIndie backends that connect to Azure services (Blob Storage, Event Grid, Service Bus, etc.) -->

# Azure Service-to-Service Authentication for AppsIndie Backends

Default to managed identity for all internal Azure service-to-service authentication to avoid secret expiry and rotation burden.

- Prefer system-assigned or user-assigned managed identity and use SDK DefaultAzureCredential / AzureDefaultCredential equivalents.
- Grant least-privilege RBAC via Terraform when the deployment identity has Microsoft.Authorization/roleAssignments/write; otherwise pre-assign roles outside Terraform and pass the identity client/resource ID into the app.
- When the deployment identity cannot assign RBAC and no pre-existing managed identity is available, do not silently fall back to a long-lived secret. Report the exact role, principal ID, and scope to the product owner for manual assignment, and keep the documented fallback (e.g., connection string / per-DB user) active only until the role is confirmed.
- Only fall back to connection strings, account keys, or SAS tokens when:
  - the SDK or service does not support managed identity, or
  - role assignment cannot be provisioned in the target environment and the product owner has approved the exception.
- When a fallback is required:
  - store secrets in Azure Key Vault or as Container App / App Service secrets,
  - inject them at runtime via environment variables or secret references,
  - never commit secrets to source control.
- Document any exception in an ADR with the context, rejected options, and flip conditions to move to managed identity once the blocker is removed.
