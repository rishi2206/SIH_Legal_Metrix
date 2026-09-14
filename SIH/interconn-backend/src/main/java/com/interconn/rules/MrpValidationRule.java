package com.interconn.rules;

import com.interconn.entity.Product;
import com.interconn.entity.Severity;
import com.interconn.entity.Violation;

import java.util.Optional;

public class MrpValidationRule implements ComplianceRule {

    @Override
    public Optional<Violation> validate(Product product) {

        if (product.getMrp() == null || product.getMrp().signum() <= 0) {

            Violation violation = new Violation();

            violation.setRuleCode("MRP_PRESENT");
            violation.setViolationType("INVALID_MRP");
            violation.setDescription("MRP is missing or invalid.");
            violation.setSeverity(Severity.HIGH);
            violation.setDetectedValue(
                    product.getMrp() == null ? null : product.getMrp().toString()
            );

            return Optional.of(violation);
        }

        return Optional.empty();
    }
}