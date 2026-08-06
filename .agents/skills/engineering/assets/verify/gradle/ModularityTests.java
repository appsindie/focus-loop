package com.appsindie.<service>;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.modulith.core.ApplicationModules;
import org.springframework.modulith.docs.Documenter;

/**
 * Architecture boundaries, verified as a test.
 *
 * <p>This is the highest-value check on the backend stack. Every other analyzer here looks
 * at one file; this one looks at how the modules depend on each other, which is the drift a
 * reviewer can otherwise only catch by reading every import in the diff — and therefore the
 * drift that actually ships.
 *
 * <p>It runs inside {@code ./gradlew check}, so a boundary violation is a build failure at
 * the moment it is written rather than an architecture finding six slices later, when
 * unwinding it is a refactor instead of an edit.
 *
 * <p>See AppsIndie Static Analysis Convention and AppsIndie Backend Architecture, API and
 * Observability Convention.
 */
class ModularityTests {

  static final ApplicationModules modules = ApplicationModules.of(Application.class);

  @Test
  void verifiesModularStructure() {
    // Fails on: a cycle between modules, a reference into another module's internals,
    // or a dependency on a module not declared as allowed.
    modules.verify();
  }

  @Test
  void modulesAreDiscovered() {
    // Guards the guard. If package layout drifts so no module is detected,
    // verify() passes vacuously and the check silently stops testing anything.
    assertThat(modules.stream()).isNotEmpty();
  }

  @Test
  void writesDocumentation() {
    // Module canvas and component diagrams, regenerated from the code rather than
    // maintained by hand. Living documents are a convention here; this is the part
    // of them that never goes stale.
    new Documenter(modules).writeDocumentation();
  }
}
