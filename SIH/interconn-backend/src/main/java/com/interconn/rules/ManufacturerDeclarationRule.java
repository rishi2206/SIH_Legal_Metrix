package com.interconn.rules;

import com.interconn.entity.Product;
import com.interconn.entity.Severity;
import com.interconn.entity.Violation;

import java.util.Optional;

public class ManufacturerDeclarationRule implements ComplianceRule {

    @Override
    public Optional<Violation> validate(Product product) {

        if (product.getManufacturer() == null ||
                product.getManufacturer().isBlank()) {

            Violation violation = new Violation();

            violation.setRuleCode("MANUFACTURER_PRESENT");
            violation.setViolationType("MISSING_MANUFACTURER");
            violation.setDescription("Manufacturer details are missing.");
            violation.setSeverity(Severity.HIGH);
            violation.setDetectedValue(product.getManufacturer());

            return Optional.of(violation);
        }

        return Optional.empty();
    }
}