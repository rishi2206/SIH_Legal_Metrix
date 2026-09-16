package com.interconn.rules;

import com.interconn.entity.Product;
import com.interconn.entity.Severity;
import com.interconn.entity.Violation;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class CountryOfOriginRule implements ComplianceRule {

    @Override
    public Optional<Violation> validate(Product product) {
        String country = product.getCountryOfOrigin();
        if (country == null || country.trim().isEmpty() || country.equalsIgnoreCase("Not provided")) {
            Violation violation = new Violation();
            violation.setRuleCode("RULE_COUNTRY_OF_ORIGIN");
            violation.setViolationType("MISSING_DECLARATION");
            violation.setDescription("Country of Origin declaration is mandatory on all packaged commodities under LMPC Rule 6(1)(aa).");
            violation.setSeverity(Severity.HIGH);
            violation.setDetectedValue("Missing / Not declared");
            violation.setExpectedValue("Country of Origin (e.g. India)");
            violation.setInspection(product.getInspection());
            return Optional.of(violation);
        }
        return Optional.empty();
    }
}
