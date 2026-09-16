package com.interconn.rules;

import com.interconn.entity.Product;
import com.interconn.entity.Severity;
import com.interconn.entity.Violation;

import java.util.Optional;

public class DeclarationPresenceRule implements ComplianceRule {

    @Override
    public Optional<Violation> validate(Product product) {

        if (product.getProductName() == null ||
                product.getProductName().isBlank()) {

            Violation violation = new Violation();

            violation.setRuleCode("PRODUCT_NAME_PRESENT");
            violation.setViolationType("MISSING_PRODUCT_NAME");
            violation.setDescription("Product name is missing.");
            violation.setSeverity(Severity.HIGH);
            violation.setDetectedValue(product.getProductName());

            return Optional.of(violation);
        }

        return Optional.empty();
    }
}