package com.interconn.service;

import com.interconn.dto.EvidenceResponse;
import com.interconn.entity.*;
import com.interconn.repository.EvidenceRepository;
import com.interconn.repository.InspectionRepository;
import com.interconn.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Service
public class EvidenceService {

    private final EvidenceRepository evidenceRepository;
    private final InspectionRepository inspectionRepository;
    private final ProductRepository productRepository;
    private final FileStorageService fileStorageService;
    private final AuditLogService auditLogService;

    public EvidenceService(
            EvidenceRepository evidenceRepository,
            InspectionRepository inspectionRepository,
            ProductRepository productRepository,
            FileStorageService fileStorageService,
            AuditLogService auditLogService) {

        this.evidenceRepository = evidenceRepository;
        this.inspectionRepository = inspectionRepository;
        this.productRepository = productRepository;
        this.fileStorageService = fileStorageService;
        this.auditLogService = auditLogService;
    }

    public EvidenceResponse createEvidence(
            UUID inspectionId,
            UUID supervisorId,
            UUID productId,
            String imageUrl,
            EvidenceType imageType) {

        Inspection inspection = inspectionRepository.findById(inspectionId)
                .orElseThrow(() -> new RuntimeException("Inspection not found"));

        if (!inspection.getSupervisor().getId().equals(supervisorId)) {
            throw new RuntimeException("You are not allowed to modify this inspection");
        }

        Product product = null;

        if (productId != null) {
            product = productRepository.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            if (!product.getInspection().getId().equals(inspectionId)) {
                throw new RuntimeException("Product does not belong to this inspection");
            }
        }

        Evidence evidence = new Evidence();
        evidence.setInspection(inspection);
        evidence.setProduct(product);
        evidence.setImageUrl(imageUrl);
        evidence.setImageType(imageType);

        Evidence savedEvidence = evidenceRepository.save(evidence);

        auditLogService.logAction(
                inspection.getSupervisor().getEmail(),
                Role.SUPERVISOR,
                inspectionId,
                AuditAction.EVIDENCE_UPLOADED,
                "Evidence uploaded: " + imageType + " (" + imageUrl + ")"
        );

        return mapToResponse(savedEvidence);
    }

    public List<EvidenceResponse> getEvidence(UUID inspectionId, UUID supervisorId) {
        Inspection inspection = inspectionRepository.findById(inspectionId)
                .orElseThrow(() -> new RuntimeException("Inspection not found"));

        if (!inspection.getSupervisor().getId().equals(supervisorId)) {
            throw new RuntimeException("You are not allowed to access this inspection");
        }

        return evidenceRepository.findByInspectionId(inspectionId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public EvidenceResponse uploadEvidence(
            UUID inspectionId,
            UUID supervisorId,
            UUID productId,
            String imageType,
            MultipartFile file) {

        Inspection inspection = inspectionRepository.findById(inspectionId)
                .orElseThrow(() -> new RuntimeException("Inspection not found"));

        if (!inspection.getSupervisor().getId().equals(supervisorId)) {
            throw new RuntimeException("You are not allowed to modify this inspection");
        }

        Product product = null;

        if (productId != null) {
            product = productRepository.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            if (!product.getInspection().getId().equals(inspectionId)) {
                throw new RuntimeException("Product does not belong to this inspection");
            }
        }

        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Image file is empty");
        }

        String contentType = file.getContentType();
        if (contentType != null && !contentType.startsWith("image/") && !contentType.equals("application/octet-stream")) {
            throw new RuntimeException("Only image files are allowed");
        }

        EvidenceType evidenceType;
        try {
            evidenceType = EvidenceType.valueOf(imageType.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid image type: " + imageType);
        }

        String imageUrl = fileStorageService.saveFile(inspectionId, file);

        Evidence evidence = new Evidence();
        evidence.setInspection(inspection);
        evidence.setProduct(product);
        evidence.setImageUrl(imageUrl);
        evidence.setImageType(evidenceType);

        Evidence savedEvidence = evidenceRepository.save(evidence);

        auditLogService.logAction(
                inspection.getSupervisor().getEmail(),
                Role.SUPERVISOR,
                inspectionId,
                AuditAction.EVIDENCE_UPLOADED,
                "Uploaded evidence image: " + evidenceType + " (" + imageUrl + ")"
        );

        return mapToResponse(savedEvidence);
    }

    private EvidenceResponse mapToResponse(Evidence evidence) {
        UUID productId = evidence.getProduct() != null ? evidence.getProduct().getId() : null;

        return new EvidenceResponse(
                evidence.getId(),
                evidence.getInspection().getId(),
                productId,
                evidence.getImageUrl(),
                evidence.getImageType(),
                evidence.getOcrText(),
                evidence.getUploadedAt()
        );
    }
}