---
name: Java Backend Deployment on Azure Container Apps for AppsIndie
id: note-a3690326c762427da10504b21ffcacb9
author: user
scope: When deploying Java backends to Azure Container Apps in any AppsIndie project
---

<!-- id: note-a3690326c762427da10504b21ffcacb9 | name: Java Backend Deployment on Azure Container Apps for AppsIndie | author: user | scope: When deploying Java backends to Azure Container Apps in any AppsIndie project -->

# Java backend deployment on Azure Container Apps

Azure Container Apps does **not** provide a built-in Java runtime stack like Azure App Service. You bring your own container image (e.g. UBI/distroless + JDK).

## JVM heap / OOM tuning

Always set `JAVA_TOOL_OPTIONS` (or `JDK_JAVA_OPTIONS`) as a container environment variable so the JVM respects the container memory limit and exits cleanly on OOM:

```bash
JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=50 -XX:+ExitOnOutOfMemoryError"
```

* `-XX:+UseContainerSupport` is enabled by default on Java 10+ (including Java 25), but the default `MaxRAMPercentage` is 25%. Explicitly set it to 50% if the workload is memory-bound and the container has at least 0.5 GiB.
* With 1 GiB prod container, 50% gives ~512 MiB max heap, leaving headroom for native/off-heap.
* With 0.5 GiB SIT container, 50% gives ~256 MiB max heap.
* `-XX:+ExitOnOutOfMemoryError` makes the container exit immediately on OOM so ACA can restart/replace it instead of keeping a zombie process.

## Container sizing defaults

| Environment | CPU | Memory | Notes |
|-------------|-----|--------|-------|
| SIT / dev   | 0.25 | 0.5 GiB | Low traffic, scale-to-zero allowed |
| Production  | 0.5  | 1 GiB   | Higher concurrency, tune `MaxRAMPercentage` to workload |

## Terraform pattern

Add variables in `variables.tf`:

```hcl
variable "cpu" { type = string, default = "0.5" }
variable "memory" { type = string, default = "1Gi" }
variable "java_tool_options" { type = string, default = "-XX:MaxRAMPercentage=50 -XX:+ExitOnOutOfMemoryError" }
```

Pass them to the container app module and add `JAVA_TOOL_OPTIONS` to the `env` map:

```hcl
module "api" {
  ...
  cpu    = var.cpu
  memory = var.memory

  env = {
    ...
    JAVA_TOOL_OPTIONS = var.java_tool_options
  }
}
```

## Verification

After deployment, verify the runtime settings by checking the container app environment variables and hitting `/actuator/info` or `/health`:

```bash
curl https://<fqdn>/alphabets/v1/health
```

If `MaxRAMPercentage` is not set, the JVM will use the default 25% of container memory, which is usually too low for a Spring Boot app and can cause unnecessary GC pressure.
