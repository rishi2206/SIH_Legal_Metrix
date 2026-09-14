package com.interconn.controller;

import com.interconn.dto.CreateProductRequest;
import com.interconn.dto.ProductResponse;
import com.interconn.dto.UpdateProductRequest;
import com.interconn.entity.User;
import com.interconn.repository.UserRepository;
import com.interconn.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/inspections")
public class ProductController {

    private final ProductService productService;
    private final UserRepository userRepository;

    public ProductController(ProductService productService, UserRepository userRepository) {
        this.productService = productService;
        this.userRepository = userRepository;
    }

    @PostMapping("/{inspectionId}/products")
    public ResponseEntity<ProductResponse> createProduct(
            @PathVariable UUID inspectionId,
            @Valid @RequestBody CreateProductRequest request,
            Authentication authentication) {

        UUID supervisorId = UUID.fromString(authentication.getName());

        ProductResponse response = productService.createProduct(
                inspectionId,
                supervisorId,
                request
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{inspectionId}/products")
    public ResponseEntity<List<ProductResponse>> getProducts(
            @PathVariable UUID inspectionId,
            Authentication authentication) {

        UUID supervisorId = UUID.fromString(authentication.getName());

        List<ProductResponse> products =
                productService.getProducts(
                        inspectionId,
                        supervisorId
                );

        return ResponseEntity.ok(products);
    }
    @PutMapping("/{inspectionId}/products/{productId}")
    public ProductResponse updateProduct(
            @PathVariable UUID inspectionId,
            @PathVariable UUID productId,
            @Valid @RequestBody UpdateProductRequest request,
            Authentication authentication) {

        UUID supervisorId = UUID.fromString(authentication.getName());

        User supervisor = userRepository.findById(supervisorId)
                .orElseThrow(() -> new RuntimeException("Supervisor not found"));

        return productService.updateProduct(
                inspectionId,
                productId,
                request,
                supervisor
        );
    }
}