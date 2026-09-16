package com.interconn.rules;

import com.interconn.entity.Product;
import com.interconn.entity.Severity;
import com.interconn.entity.Violation;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Optional;

@Component
public class UnitSalePriceRule implements ComplianceRule {

    @Override
    public Optional<Violation> validate(Product product) {
        BigDecimal mrp = product.getMrp();
        String netQty = product.getNetQuantity();

        if (mrp == null || netQty == null || netQty.trim().isEmpty()) {
            Violation violation = new Violation();
            violation.setRuleCode("RULE_UNIT_SALE_PRICE");
            violation.setViolationType("NON_COMPLIANT_PRICE");
            violation.setDescription("Unit Sale Price calculation requires valid MRP and Net Quantity declarations under LMPC Rule 6(11).");
            violation.setSeverity(Severity.MEDIUM);
            violation.setDetectedValue("MRP: " + (mrp != null ? mrp.toString() : "null") + ", NetQty: " + netQty);
            violation.setExpectedValue("Calculable Unit Sale Price (e.g. ₹0.028/g)");
            violation.setInspection(product.getInspection());
            return Optional.of(violation);
        }
        return Optional.empty();
    }
}
