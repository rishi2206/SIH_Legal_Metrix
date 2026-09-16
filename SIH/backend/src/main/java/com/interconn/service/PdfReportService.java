package com.interconn.service;

import com.interconn.entity.*;
import com.interconn.repository.EvidenceRepository;
import com.interconn.repository.InspectionRepository;
import com.interconn.repository.ProductRepository;
import com.interconn.repository.ViolationRepository;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
public class PdfReportService {

    private final InspectionRepository inspectionRepository;
    private final ProductRepository productRepository;
    private final EvidenceRepository evidenceRepository;
    private final ViolationRepository violationRepository;
    private final SupabaseStorageService supabaseStorageService;
    private final AuditLogService auditLogService;

    public PdfReportService(
            InspectionRepository inspectionRepository,
            ProductRepository productRepository,
            EvidenceRepository evidenceRepository,
            ViolationRepository violationRepository,
            SupabaseStorageService supabaseStorageService,
            AuditLogService auditLogService) {

        this.inspectionRepository = inspectionRepository;
        this.productRepository = productRepository;
        this.evidenceRepository = evidenceRepository;
        this.violationRepository = violationRepository;
        this.supabaseStorageService = supabaseStorageService;
        this.auditLogService = auditLogService;
    }

    public String generateReport(UUID inspectionId, UUID supervisorId) {
        Inspection inspection = inspectionRepository.findById(inspectionId)
                .orElseThrow(() -> new RuntimeException("Inspection not found"));

        if (!inspection.getSupervisor().getId().equals(supervisorId)) {
            throw new RuntimeException("You are not allowed to generate this report");
        }

        List<Product> products = productRepository.findByInspectionId(inspectionId);
        List<Evidence> evidenceList = evidenceRepository.findByInspectionId(inspectionId);
        List<Violation> violations = violationRepository.findByInspectionId(inspectionId);

        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            Document document = new Document();
            PdfWriter.getInstance(document, baos);
            document.open();

            // Header Title
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Paragraph title = new Paragraph("InterConn", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            boolean isDispatchCheck = inspection.getInspectionType() == InspectionType.DISPATCH_CHECK;

            Paragraph subtitle = new Paragraph(
                    isDispatchCheck
                            ? "Pre-Dispatch Label & Compliance Check Report"
                            : "Statutory LMPC Compliance Inspection Report"
            );
            subtitle.setAlignment(Element.ALIGN_CENTER);
            document.add(subtitle);
            document.add(new Paragraph(" "));

            // Inspection Details
            document.add(new Paragraph("INSPECTION DETAILS", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13)));
            document.add(new Paragraph("Inspection ID: " + inspection.getId()));
            document.add(new Paragraph("Inspection Date: " + inspection.getInspectionDate()));
            document.add(new Paragraph((isDispatchCheck ? "Checked By: " : "Supervisor: ") + inspection.getSupervisor().getName()));
            document.add(new Paragraph((isDispatchCheck ? "Company Email: " : "Supervisor Email: ") + inspection.getSupervisor().getEmail()));
            document.add(new Paragraph("Location: " + (inspection.getLocation() == null ? "Not provided" : inspection.getLocation())));
            document.add(new Paragraph("Result: " + (inspection.getOverallResult() == null ? "Not evaluated" : inspection.getOverallResult())));
            document.add(new Paragraph("Status: " + inspection.getStatus()));
            document.add(new Paragraph(" "));

            // Product Details
            document.add(new Paragraph("PRODUCT DETAILS", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13)));
            for (Product product : products) {
                document.add(new Paragraph("Product Name: " + value(product.getProductName())));
                document.add(new Paragraph("Brand: " + value(product.getBrandName())));
                document.add(new Paragraph("Manufacturer: " + value(product.getManufacturer())));
                document.add(new Paragraph("Manufacturer Address: " + value(product.getManufacturerAddress())));
                document.add(new Paragraph("MRP: " + value(product.getMrp())));
                document.add(new Paragraph("Net Quantity: " + value(product.getNetQuantity())));
                document.add(new Paragraph("Manufacturing Date: " + value(product.getManufacturingOrPackingDate())));
                document.add(new Paragraph("Expiry Date: " + value(product.getExpiryDate())));
                document.add(new Paragraph("Country of Origin: " + value(product.getCountryOfOrigin())));
                document.add(new Paragraph("Batch Number: " + value(product.getBatchNumber())));
                document.add(new Paragraph("Consumer Care: " + value(product.getConsumerCareDetails())));
                document.add(new Paragraph("Verification Status: " + product.getVerificationStatus()));
                document.add(new Paragraph(" "));
            }

            // Violations Section
            document.add(new Paragraph("VIOLATIONS", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13)));
            if (violations.isEmpty()) {
                document.add(new Paragraph("No statutory violations detected. Fully compliant."));
            } else {
                for (Violation violation : violations) {
                    document.add(new Paragraph("Rule Code: " + violation.getRuleCode()));
                    document.add(new Paragraph("Type: " + value(violation.getViolationType())));
                    document.add(new Paragraph("Description: " + value(violation.getDescription())));
                    document.add(new Paragraph("Severity: " + value(violation.getSeverity())));
                    document.add(new Paragraph("Detected Value: " + value(violation.getDetectedValue())));
                    document.add(new Paragraph("Expected Value: " + value(violation.getExpectedValue())));
                    document.add(new Paragraph(" "));
                }
            }

            // Evidence Section
            document.add(new Paragraph("EVIDENCE ATTACHMENTS", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13)));
            if (evidenceList.isEmpty()) {
                document.add(new Paragraph("No evidence uploaded."));
            } else {
                for (Evidence evidence : evidenceList) {
                    document.add(new Paragraph("Evidence Type: " + evidence.getImageType()));
                    document.add(new Paragraph("Storage URL/Path: " + evidence.getImageUrl()));
                    document.add(new Paragraph("Uploaded At: " + evidence.getUploadedAt()));
                    document.add(new Paragraph(" "));
                }
            }

            // Footer
            document.add(new Paragraph(" "));
            document.add(new Paragraph("Report Generated At: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))));
            document.add(new Paragraph("Generated by InterConn Compliance Inspection System"));

            document.close();

            String fileName = "inspection-" + inspectionId + "-" + System.currentTimeMillis() + ".pdf";
            String storageUrl = supabaseStorageService.uploadReport(inspectionId, baos.toByteArray(), fileName);

            auditLogService.logAction(
                    inspection.getSupervisor().getEmail(),
                    Role.SUPERVISOR,
                    inspectionId,
                    AuditAction.REPORT_GENERATED,
                    "Generated statutory inspection report PDF: " + storageUrl
            );

            return storageUrl;

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate inspection report", e);
        }
    }

    private String value(Object value) {
        return value == null ? "Not provided" : value.toString();
    }
}