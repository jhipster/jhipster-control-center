package tech.jhipster.controlcenter;

import com.tngtech.archunit.core.domain.JavaClasses;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import com.tngtech.archunit.core.importer.ImportOption;
import org.junit.jupiter.api.Test;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

class ArchTest {

    @Test
    void servicesAndRepositoriesShouldNotDependOnWebLayer() {

        JavaClasses importedClasses = new ClassFileImporter()
            .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_TESTS)
            .importPackages("tech.jhipster.controlcenter");

        noClasses()
            .that()
                .resideInAnyPackage("tech.jhipster.controlcenter.service..")
            .or()
                .resideInAnyPackage("tech.jhipster.controlcenter.repository..")
            .should().dependOnClassesThat()
                .resideInAnyPackage("..tech.jhipster.controlcenter.web..")
        .because("Services and repositories should not depend on web layer")
        .check(importedClasses);
    }
}
