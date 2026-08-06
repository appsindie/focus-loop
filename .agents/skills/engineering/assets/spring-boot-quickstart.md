# Spring Boot Quickstart Checklist

Use this when a build issue requires scaffolding a new Spring Boot service.

## Inputs
- Service name and bounded context
- API surface requirements
- Data store requirements
- Security and compliance requirements

## Bootstrap steps
1. Create a Spring Boot project using Spring Initializr with required modules.
2. Set Java version, build tool (Maven or Gradle), and packaging conventions.
3. Establish baseline module structure (`api`, `application`, `domain`, `infrastructure`).
4. Add health checks and operational endpoints.
5. Configure error handling, validation, and API contract conventions.
6. Configure static analysis per **AppsIndie Static Analysis Convention**, before the first feature slice. Start from `.agents/skills/engineering/assets/verify/gradle/` rather than assembling this by hand:
   - Spotless with `google-java-format`, bound into `check`.
   - Compiler flags `-Xlint:all -Werror`.
   - Error Prone + NullAway, and SpotBugs with the **FindSecBugs** plugin.
   - Spring Modulith `ApplicationModules.verify()` as a test, plus ArchUnit rules for the `api` / `application` / `domain` / `infrastructure` layering above.
   - `./gradlew check` is the single entry point agents run; nothing above may be optional or manual.
   - A separate `audit` task for dependency CVEs (OWASP Dependency-Check with a free NVD API key, `osv-scanner`, or Trivy). Kept out of `check` because its result changes when the advisory database moves, not when the code does.
7. Add baseline test layout (unit + integration smoke).
8. Configure environment profiles and secret loading strategy.
9. Add containerization and runtime metadata if deployment target requires it.

## Required evidence
- Generation inputs and resulting dependency manifest.
- Baseline API and health endpoint verification output.
- Unit/integration smoke test output.
- Compatibility and migration notes for upstream/downstream consumers.
