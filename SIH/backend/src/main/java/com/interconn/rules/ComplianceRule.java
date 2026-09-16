package com.interconn.rules;

import com.interconn.entity.Product;
import com.interconn.entity.Violation;

import java.util.Optional;

public interface ComplianceRule {

    Optional<Violation> validate(Product product);
}