// Paste into build.gradle.kts. Snippet, not an `apply from:` script — plugin
// declarations must live in the root build file's own `plugins` block.
//
// See .agents/skills/engineering/assets/verify/README.md.
//
// VERSIONS ARE A STARTING POINT, NOT A PIN TO PRESERVE. Check current releases
// when you bootstrap: an old Error Prone against a current JDK fails in
// confusing ways that look like your code's fault.

plugins {
    java
    id("com.diffplug.spotless") version "7.0.2"
    id("net.ltgt.errorprone") version "4.1.0"
    id("com.github.spotbugs") version "6.1.3"
    id("org.owasp.dependencycheck") version "12.1.0"
}

dependencies {
    errorprone("com.google.errorprone:error_prone_core:2.36.0")
    errorprone("com.uber.nullaway:nullaway:0.12.3")

    // FindSecBugs adds ~130 security detectors to SpotBugs: injection sinks,
    // weak crypto, unsafe deserialization, path traversal.
    spotbugsPlugins("com.h3xstream.findsecbugs:findsecbugs-plugin:1.13.0")
}

// --- Formatting --------------------------------------------------------------
// Formatting is never a review comment. `spotlessApply` fixes, `spotlessCheck`
// (wired into `check` by the plugin) enforces.
spotless {
    java {
        googleJavaFormat()
        removeUnusedImports()
        trimTrailingWhitespace()
        endWithNewline()
    }
    kotlinGradle { ktlint() }
}

// --- Compiler and Error Prone ------------------------------------------------
tasks.withType<JavaCompile>().configureEach {
    options.compilerArgs.addAll(listOf("-Xlint:all", "-Werror"))

    options.errorprone {
        disableWarningsInGeneratedCode.set(true)
        // Generated sources (MapStruct, protobuf, JPA metamodel) are not yours
        // to fix, and their findings drown the ones that are.
        excludedPaths.set(".*/build/generated/.*")

        // NullAway turns NPEs from a runtime surprise into a compile error.
        // Set the package prefix to your own — an empty or over-broad value
        // makes it analyse dependencies and produce noise.
        error("NullAway")
        option("NullAway:AnnotatedPackages", "com.appsindie")
    }
}

// Error Prone's own checks are compile errors, not warnings — the ratchet in the
// convention means a warning nobody must fix is a warning everybody ignores.

// --- SpotBugs ----------------------------------------------------------------
spotbugs {
    effort.set(com.github.spotbugs.snom.Effort.MAX)
    reportLevel.set(com.github.spotbugs.snom.Confidence.DEFAULT)
    // No `excludeFilter` by default. Add one only with a reason per entry —
    // a blanket exclusions file is how a security scanner quietly stops working.
}

tasks.spotbugsTest { enabled = false }

// --- audit -------------------------------------------------------------------
// Dependency CVEs. NOT wired into `check`, deliberately: this result changes when
// the advisory database moves rather than when the code does, so it cannot gate
// the edit loop. Slice completion, before each gate, and weekly in CI.
//
// The task name is load-bearing: ci-light.yml looks for exactly `audit` and fails
// the build if it is absent. Do not rename it.
dependencyCheck {
    failBuildOnCVSS = 7.0f // high and above
    // A free NVD API key makes the database sync minutes rather than hours.
    nvd.apiKey = System.getenv("NVD_API_KEY")
    analyzers.assemblyEnabled = false
    suppressionFile = "config/dependency-check-suppressions.xml"
}

tasks.register("audit") {
    group = "verification"
    description = "Dependency vulnerability scan. Separate from `check` — see the convention."
    dependsOn("dependencyCheckAnalyze")
}

// A suppression in config/dependency-check-suppressions.xml is a RISK ACCEPTANCE,
// not a fix: each entry states why the vulnerable path is unreachable from this
// code, and carries a recheck date. Acceptance is time-boxed, never permanent.
