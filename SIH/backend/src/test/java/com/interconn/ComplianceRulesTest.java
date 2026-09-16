package com.interconn;

import com.interconn.entity.Product;
import com.interconn.entity.Violation;
import com.interconn.rules.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

class ComplianceRulesTest {

    private Product product;

    @BeforeEach
    void setUp() {
        product = new Product();
        product.setProductName("Tata Salt");
        product.setBrandName("Tata");
        product.setManufacturer("Tata Consumer Products Ltd");
        product.setManufacturerAddress("123 Industrial Estate, Mumbai");
        product.setMrp(new BigDecimal("28.00"));
        product.setNetQuantity("1 kg");
        product.setCountryOfOrigin("India");
        product.setBatchNumber("B12345");
        product.setConsumerCareDetails("1800-208-1931");
    }

    @Test
    void testCompliantProduct() {
        CountryOfOriginRule countryRule = new CountryOfOriginRule();
        ConsumerCareRule careRule = new ConsumerCareRule();
        UnitSalePriceRule priceRule = new UnitSalePriceRule();

        assertFalse(countryRule.validate(product).isPresent());
        assertFalse(careRule.validate(product).isPresent());
        assertFalse(priceRule.validate(product).isPresent());
    }

    @Test
    void testMissingCountryOfOrigin() {
        product.setCountryOfOrigin(null);
        CountryOfOriginRule countryRule = new CountryOfOriginRule();
        Optional<Violation> violation = countryRule.validate(product);

        assertTrue(violation.isPresent());
        assertEquals("RULE_COUNTRY_OF_ORIGIN", violation.get().getRuleCode());
    }

    @Test
    void testMissingConsumerCare() {
        product.setConsumerCareDetails(null);
        ConsumerCareRule careRule = new ConsumerCareRule();
        Optional<Violation> violation = careRule.validate(product);

        assertTrue(violation.isPresent());
        assertEquals("RULE_CONSUMER_CARE", violation.get().getRuleCode());
    }

    @Test
    void testMissingMrpForUnitPrice() {
        product.setMrp(null);
        UnitSalePriceRule priceRule = new UnitSalePriceRule();
        Optional<Violation> violation = priceRule.validate(product);

        assertTrue(violation.isPresent());
        assertEquals("RULE_UNIT_SALE_PRICE", violation.get().getRuleCode());
    }
}
