package com.interconn.rules;

import com.interconn.entity.Product;
import com.interconn.entity.Severity;
import com.interconn.entity.Violation;

import java.util.Optional;

public class DateDeclarationRule implements ComplianceRule {

    @Override
    public Optional<Violation> validate(Product product) {

        if (product.getManufacturingOrPackingDate() == null) {

            Violation violation = new Violation();

            violation.setRuleCode("DATE_PRESENT");
            violation.setViolationType("MISSING_MANUFACTURING_PACKING_DATE");
            violation.setDescription(
                    "Manufacturing or packing date is missing."
            );
            violation.setSeverity(Severity.MEDIUM);

            return Optional.of(violation);
        }

        return Optional.empty();
    }
}