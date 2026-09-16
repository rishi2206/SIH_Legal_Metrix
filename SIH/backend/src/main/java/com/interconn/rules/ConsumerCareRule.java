package com.interconn.rules;

import com.interconn.entity.Product;
import com.interconn.entity.Severity;
import com.interconn.entity.Violation;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class ConsumerCareRule implements ComplianceRule {

    @Override
    public Optional<Violation> validate(Product product) {
        String careDetails = product.getConsumerCareDetails();
        if (careDetails == null || careDetails.trim().isEmpty() || careDetails.equalsIgnoreCase("Not provided")) {
            Violation violation = new Violation();
            violation.setRuleCode("RULE_CONSUMER_CARE");
            violation.setViolationType("MISSING_DECLARATION");
            violation.setDescription("Consumer Care helpline/email/address details mandatory under LMPC Rule 6(1)(n).");
            violation.setSeverity(Severity.HIGH);
            violation.setDetectedValue("Missing / Not declared");
            violation.setExpectedValue("Customer Care contact info (phone/email/address)");
            violation.setInspection(product.getInspection());
            return Optional.of(violation);
        }
        return Optional.empty();
    }
}
