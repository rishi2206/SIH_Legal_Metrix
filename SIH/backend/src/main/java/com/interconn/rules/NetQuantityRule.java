package com.interconn.rules;

import com.interconn.entity.Product;
import com.interconn.entity.Severity;
import com.interconn.entity.Violation;

import java.util.Optional;

public class NetQuantityRule implements ComplianceRule {

    @Override
    public Optional<Violation> validate(Product product) {

        if (product.getNetQuantity() == null ||
                product.getNetQuantity().isBlank()) {

            Violation violation = new Violation();

            violation.setRuleCode("NET_QUANTITY_PRESENT");
            violation.setViolationType("MISSING_NET_QUANTITY");
            violation.setDescription("Net quantity is missing.");
            violation.setSeverity(Severity.HIGH);
            violation.setDetectedValue(product.getNetQuantity());

            return Optional.of(violation);
        }

        return Optional.empty();
    }
}