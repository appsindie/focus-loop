---
name: Azure SIT/Prod Infra Boundary for AppsIndie
id: note-2a25edb151ec4834a6fa655e8a94c057
author: user
scope: When deploying AppsIndie apps to Azure SIT or production environments
---

<!-- id: note-2a25edb151ec4834a6fa655e8a94c057 | name: Azure SIT/Prod Infra Boundary for AppsIndie | author: user | scope: When deploying AppsIndie apps to Azure SIT or production environments -->

# AppsIndie Azure SIT/Prod Infra Boundary — MUST follow

When deploying any AppsIndie application to Azure, infrastructure is split between **human-provisioned shared resources** and **app-specific per-environment resources**. Do not create the shared resources from Terraform/app pipelines.

## Human-provisioned shared resources (one per environment, manual)

- **Container App Environment (CAE):** one `cae-<env>` for the whole SIT environment, one for PROD. All apps in that environment deploy their Container Apps into this shared CAE.
- **Shared PostgreSQL flexible server:** one server (e.g. `[REDACTED SECRET]`) per environment. Each app creates its own database and per-DB user/password on this server.
- **Log Analytics workspace:** one per environment for the shared CAE.
- **Azure Communication Services:** one instance shared across all apps.
- **CDN:** one per environment for external-facing assets (images, static files).

## App-provisioned per-environment resources (Terraform/app pipeline)

- **Resource group:** `rg-<app>-<env>`.
- **Container Apps:** `ca-<app>-<env>-api`, `ca-<app>-<env>-web`, etc. inside the shared CAE.
- **Database:** one database and one user per app per environment on the shared PostgreSQL server (e.g. `<app>_<env>` / `<app>_<env>_user`).
- **Internal Blob / Queue Storage:** one storage account per environment for app-internal temp files, exports, queues.
- **Event Grid topic (classic):** one per environment. Consumers filter by `eventType`.
- **Application Insights:** per app, optional.
- **Managed identity:** per app per environment for Blob/Event Grid access; RBAC role assignments provisioned where the deployment identity has `Microsoft.Authorization/roleAssignments/write`, otherwise documented for manual assignment.

## Container Registry

Use GitHub Packages (`ghcr.io`) by default, not ACR. Container Apps pull from `ghcr.io` using a GitHub PAT stored as a Container App secret.

## What NOT to create

- Do not create a dedicated PostgreSQL server per app.
- Do not create a dedicated Container App Environment per app.
- Do not create ACR unless explicitly required.
- Do not create Log Analytics or CDN as app-specific resources.

## SIT example for `appsindie-qr-bib`

- Shared CAE: `cae-qrbib-sit`
- Shared PostgreSQL: `[REDACTED SECRET]`
- App DB/user: `qrbib_sit` / `qrbib_sit_user`
- App resource group: `rg-qrbib-sit`
- Container Apps: `ca-qrbib-sit-api`, `ca-qrbib-sit-web`
- Storage/Event Grid: `stqrbibsit`, `egt-qrbib-sit`
