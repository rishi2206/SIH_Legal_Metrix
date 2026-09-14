package com.interconn.service;

import com.interconn.dto.CreateProductRequest;
import com.interconn.dto.ProductResponse;
import com.interconn.dto.UpdateProductRequest;
import com.interconn.entity.*;
import com.interconn.repository.InspectionRepository;
import com.interconn.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final InspectionRepository inspectionRepository;
    private final AuditLogService auditLogService;

    public ProductService(
            ProductRepository productRepository,
            InspectionRepository inspectionRepository,
            AuditLogService auditLogService) {

        this.productRepository = productRepository;
        this.inspectionRepository = inspectionRepository;
        this.auditLogService = auditLogService;
    }

    public ProductResponse createProduct(
            UUID inspectionId,
            UUID supervisorId,
            CreateProductRequest request) {

        Inspection inspection = inspectionRepository.findById(inspectionId)
                .orElseThrow(() -> new RuntimeException("Inspection not found"));

        if (!inspection.getSupervisor().getId().equals(supervisorId)) {
            throw new RuntimeException("You are not allowed to modify this inspection");
        }

        Product product = new Product();
        product.setInspection(inspection);
        product.setProductName(request.getProductName());
        product.setBrandName(request.getBrandName());
        product.setManufacturer(request.getManufacturer());
        product.setManufacturerAddress(request.getManufacturerAddress());
        product.setMrp(request.getMrp());
        product.setNetQuantity(request.getNetQuantity());
        product.setManufacturingOrPackingDate(request.getManufacturingOrPackingDate());
        product.setExpiryDate(request.getExpiryDate());
        product.setCountryOfOrigin(request.getCountryOfOrigin());
        product.setBatchNumber(request.getBatchNumber());
        product.setConsumerCareDetails(request.getConsumerCareDetails());
        product.setVerificationStatus(VerificationStatus.PENDING);

        Product savedProduct = productRepository.save(product);

        auditLogService.logAction(
                inspection.getSupervisor().getEmail(),
                Role.SUPERVISOR,
                inspectionId,
                AuditAction.PRODUCT_MODIFIED,
                "Created product record: " + savedProduct.getProductName()
        );

        return mapToResponse(savedProduct);
    }

    public List<ProductResponse> getProducts(
            UUID inspectionId,
            UUID supervisorId) {

        Inspection inspection = inspectionRepository.findById(inspectionId)
                .orElseThrow(() -> new RuntimeException("Inspection not found"));

        if (!inspection.getSupervisor().getId().equals(supervisorId)) {
            throw new RuntimeException("You are not allowed to access this inspection");
        }

        return productRepository.findByInspectionId(inspectionId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public ProductResponse updateProduct(
            UUID inspectionId,
            UUID productId,
            UpdateProductRequest request,
            User supervisor) {

        Inspection inspection = inspectionRepository.findById(inspectionId)
                .orElseThrow(() -> new RuntimeException("Inspection not found"));

        if (!inspection.getSupervisor().getId().equals(supervisor.getId())) {
            throw new RuntimeException("You are not allowed to modify this inspection");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.getInspection().getId().equals(inspectionId)) {
            throw new RuntimeException("Product does not belong to this inspection");
        }

        product.setProductName(request.getProductName());
        product.setBrandName(request.getBrandName());
        product.setManufacturer(request.getManufacturer());
        product.setManufacturerAddress(request.getManufacturerAddress());
        product.setMrp(request.getMrp());
        product.setNetQuantity(request.getNetQuantity());
        product.setManufacturingOrPackingDate(request.getManufacturingOrPackingDate());
        product.setExpiryDate(request.getExpiryDate());
        product.setCountryOfOrigin(request.getCountryOfOrigin());
        product.setBatchNumber(request.getBatchNumber());
        product.setConsumerCareDetails(request.getConsumerCareDetails());

        product.setVerificationStatus(VerificationStatus.VERIFIED);

        Product savedProduct = productRepository.save(product);

        auditLogService.logAction(
                supervisor.getEmail(),
                supervisor.getRole(),
                inspectionId,
                AuditAction.PRODUCT_VERIFIED,
                "Supervisor verified product details: " + savedProduct.getProductName() + " (MRP: " + savedProduct.getMrp() + ")"
        );

        return mapToResponse(savedProduct);
    }

    private ProductResponse mapToResponse(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getInspection().getId(),
                product.getProductName(),
                product.getBrandName(),
                product.getManufacturer(),
                product.getManufacturerAddress(),
                product.getMrp(),
                product.getNetQuantity(),
                product.getManufacturingOrPackingDate(),
                product.getExpiryDate(),
                product.getCountryOfOrigin(),
                product.getBatchNumber(),
                product.getConsumerCareDetails(),
                product.getVerificationStatus()
        );
    }
}