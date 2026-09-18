package com.interconn.service;

import com.interconn.entity.*;
import com.interconn.repository.EvidenceRepository;
import com.interconn.repository.InspectionRepository;
import com.interconn.repository.ProductRepository;
import com.interconn.repository.ViolationRepository;
import com.lowagie.text.*;
import com.lowagie.text.Image;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfPageEventHelper;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
public class PdfReportService {

    // ---- Brand palette ----
    private static final Color BRAND_TEAL = new Color(13, 115, 108);
    private static final Color BRAND_TEAL_DARK = new Color(9, 79, 74);
    private static final Color INK = new Color(30, 41, 59);
    private static final Color MUTED = new Color(100, 116, 139);
    private static final Color STRIPE = new Color(244, 247, 246);
    private static final Color BORDER = new Color(214, 222, 220);
    private static final Color SUCCESS = new Color(21, 128, 61);
    private static final Color SUCCESS_BG = new Color(220, 245, 232);
    private static final Color WARNING = new Color(180, 108, 0);
    private static final Color WARNING_BG = new Color(255, 243, 220);
    private static final Color DANGER = new Color(185, 28, 28);
    private static final Color DANGER_BG = new Color(253, 226, 226);
    private static final Color WHITE = Color.WHITE;

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

        boolean isDispatchCheck = inspection.getInspectionType() == InspectionType.DISPATCH_CHECK;

        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4, 46, 46, 50, 56);
            PdfWriter writer = PdfWriter.getInstance(document, baos);
            writer.setPageEvent(new BorderAndFooterEvent());
            document.open();

            addHeader(document, isDispatchCheck);
            addComplianceScoreBadge(document, inspection);
            addInspectionDetails(document, inspection, isDispatchCheck);
            addProductDetails(document, products);
            addViolations(document, violations);
            addEvidence(document, evidenceList);
            addFooterNote(document);

            document.close();

            String fileName = "inspection-" + inspectionId + "-" + System.currentTimeMillis() + ".pdf";
            String storageUrl = supabaseStorageService.uploadReport(inspectionId, baos.toByteArray(), fileName);

            auditLogService.logAction(
                    inspection.getSupervisor().getEmail(),
                    inspection.getSupervisor().getRole(),
                    inspectionId,
                    AuditAction.REPORT_GENERATED,
                    "Generated " + (isDispatchCheck ? "dispatch check" : "statutory inspection") + " report PDF: " + storageUrl
            );

            return storageUrl;

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate inspection report", e);
        }
    }

    // ---------------------------------------------------------------------
    // Sections
    // ---------------------------------------------------------------------

    private void addHeader(Document document, boolean isDispatchCheck) throws DocumentException {
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, BRAND_TEAL_DARK);
        Paragraph title = new Paragraph("LegalMetriX", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);

        Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA, 12, MUTED);
        Paragraph subtitle = new Paragraph(
                isDispatchCheck
                        ? "Pre-Dispatch Label & Compliance Check Report"
                        : "Statutory LMPC Compliance Inspection Report",
                subtitleFont
        );
        subtitle.setAlignment(Element.ALIGN_CENTER);
        subtitle.setSpacingAfter(4);
        document.add(subtitle);

        addRule(document, BRAND_TEAL, 1.4f, 10, 16);
    }

    private void addComplianceScoreBadge(Document document, Inspection inspection) throws DocumentException {
        Double score = inspection.getComplianceScore();
        if (score == null) {
            return;
        }

        Color badgeColor = SUCCESS;
        Color badgeBg = SUCCESS_BG;
        String verdict = "Fully Compliant";
        if (score < 50) {
            badgeColor = DANGER;
            badgeBg = DANGER_BG;
            verdict = "Non-Compliant";
        } else if (score < 80) {
            badgeColor = WARNING;
            badgeBg = WARNING_BG;
            verdict = "Partially Compliant";
        }

        PdfPTable badge = new PdfPTable(1);
        badge.setWidthPercentage(100);
        badge.setSpacingAfter(14);

        PdfPCell cell = new PdfPCell();
        cell.setBackgroundColor(badgeBg);
        cell.setBorderColor(badgeColor);
        cell.setBorderWidth(1f);
        cell.setPadding(14);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);

        Paragraph scoreLine = new Paragraph();
        scoreLine.setAlignment(Element.ALIGN_CENTER);
        scoreLine.add(new Chunk(trimScore(score) + "% ", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 26, badgeColor)));
        scoreLine.add(new Chunk("Compliance Score", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13, badgeColor)));
        cell.addElement(scoreLine);

        Paragraph verdictLine = new Paragraph(verdict, FontFactory.getFont(FontFactory.HELVETICA, 10, MUTED));
        verdictLine.setAlignment(Element.ALIGN_CENTER);
        verdictLine.setSpacingBefore(2);
        cell.addElement(verdictLine);

        badge.addCell(cell);
        document.add(badge);
    }

    private void addInspectionDetails(Document document, Inspection inspection, boolean isDispatchCheck) throws DocumentException {
        addSectionHeader(document, "INSPECTION DETAILS");

        PdfPTable table = newKeyValueTable();
        addRow(table, "Inspection ID", inspection.getId().toString());
        addRow(table, "Inspection Date", value(inspection.getInspectionDate()));
        addRow(table, isDispatchCheck ? "Checked By" : "Supervisor", inspection.getSupervisor().getName());
        addRow(table, isDispatchCheck ? "Company Email" : "Supervisor Email", inspection.getSupervisor().getEmail());
        addRow(table, "Location", value(inspection.getLocation()));
        addRow(table, "Result", inspection.getOverallResult() == null ? "Not evaluated" : inspection.getOverallResult().toString());
        addRow(table, "Status", inspection.getStatus().toString());
        document.add(table);
        addSpacer(document, 12);
    }

    private void addProductDetails(Document document, List<Product> products) throws DocumentException {
        addSectionHeader(document, "PRODUCT DETAILS");

        if (products.isEmpty()) {
            document.add(mutedNote("No products recorded for this inspection."));
            addSpacer(document, 12);
            return;
        }

        for (int i = 0; i < products.size(); i++) {
            Product product = products.get(i);

            Paragraph label = new Paragraph(
                    "Product " + (i + 1) + " of " + products.size(),
                    FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, BRAND_TEAL)
            );
            label.setSpacingBefore(i == 0 ? 0 : 8);
            document.add(label);

            PdfPTable table = newKeyValueTable();
            addRow(table, "Product Name", value(product.getProductName()));
            addRow(table, "Brand", value(product.getBrandName()));
            addRow(table, "Manufacturer", value(product.getManufacturer()));
            addRow(table, "Manufacturer Address", value(product.getManufacturerAddress()));
            addRow(table, "MRP", value(product.getMrp()));
            addRow(table, "Net Quantity", value(product.getNetQuantity()));
            addRow(table, "Manufacturing Date", value(product.getManufacturingOrPackingDate()));
            addRow(table, "Expiry Date", value(product.getExpiryDate()));
            addRow(table, "Country of Origin", value(product.getCountryOfOrigin()));
            addRow(table, "Batch Number", value(product.getBatchNumber()));
            addRow(table, "Consumer Care", value(product.getConsumerCareDetails()));
            addRow(table, "Verification Status", product.getVerificationStatus().toString());
            document.add(table);
        }
        addSpacer(document, 12);
    }

    private void addViolations(Document document, List<Violation> violations) throws DocumentException {
        addSectionHeader(document, "VIOLATIONS");

        if (violations.isEmpty()) {
            PdfPTable clean = new PdfPTable(1);
            clean.setWidthPercentage(100);
            PdfPCell cell = new PdfPCell(new Phrase(
                    "No statutory violations detected. Fully compliant.",
                    FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, SUCCESS)
            ));
            cell.setBackgroundColor(SUCCESS_BG);
            cell.setBorderColor(SUCCESS);
            cell.setPadding(10);
            clean.addCell(cell);
            document.add(clean);
            addSpacer(document, 12);
            return;
        }

        for (Violation violation : violations) {
            Color sevColor = severityColor(violation.getSeverity());
            Color sevBg = severityBg(violation.getSeverity());

            PdfPTable box = new PdfPTable(2);
            box.setWidthPercentage(100);
            box.setWidths(new float[]{62, 38});
            box.setSpacingBefore(6);

            PdfPCell head = new PdfPCell(new Phrase(
                    "Rule " + value(violation.getRuleCode()) + " — " + value(violation.getViolationType()),
                    FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, WHITE)
            ));
            head.setColspan(1);
            head.setBackgroundColor(INK);
            head.setPadding(6);
            head.setBorderColor(BORDER);
            box.addCell(head);

            PdfPCell sevCell = new PdfPCell(new Phrase(
                    value(violation.getSeverity()).toUpperCase(),
                    FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, sevColor)
            ));
            sevCell.setBackgroundColor(sevBg);
            sevCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            sevCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            sevCell.setPadding(6);
            sevCell.setBorderColor(BORDER);
            box.addCell(sevCell);

            PdfPCell body = new PdfPCell();
            body.setColspan(2);
            body.setPadding(8);
            body.setBorderColor(BORDER);

            Font labelFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, MUTED);
            Font valueFont = FontFactory.getFont(FontFactory.HELVETICA, 9, INK);

            Paragraph desc = new Paragraph();
            desc.add(new Chunk("Description: ", labelFont));
            desc.add(new Chunk(value(violation.getDescription()), valueFont));
            body.addElement(desc);

            Paragraph detected = new Paragraph();
            detected.setSpacingBefore(3);
            detected.add(new Chunk("Detected Value: ", labelFont));
            detected.add(new Chunk(value(violation.getDetectedValue()), valueFont));
            body.addElement(detected);

            Paragraph expected = new Paragraph();
            expected.setSpacingBefore(3);
            expected.add(new Chunk("Expected Value: ", labelFont));
            expected.add(new Chunk(value(violation.getExpectedValue()), valueFont));
            body.addElement(expected);

            box.addCell(body);
            document.add(box);
        }
        addSpacer(document, 12);
    }

    private void addEvidence(Document document, List<Evidence> evidenceList) throws DocumentException {
        addSectionHeader(document, "EVIDENCE ATTACHMENTS");

        if (evidenceList.isEmpty()) {
            document.add(mutedNote("No evidence uploaded."));
            return;
        }

        for (Evidence evidence : evidenceList) {
            PdfPTable box = new PdfPTable(1);
            box.setWidthPercentage(100);
            box.setSpacingBefore(6);

            PdfPCell captionCell = new PdfPCell(new Phrase(
                    value(evidence.getImageType()) + "  ·  uploaded " + value(evidence.getUploadedAt()),
                    FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, WHITE)
            ));
            captionCell.setBackgroundColor(BRAND_TEAL);
            captionCell.setPadding(6);
            box.addCell(captionCell);

            PdfPCell imageCell = new PdfPCell();
            imageCell.setPadding(10);
            imageCell.setBorderColor(BORDER);
            imageCell.setHorizontalAlignment(Element.ALIGN_CENTER);

            try {
                byte[] bytes = supabaseStorageService.downloadFile(evidence.getImageUrl());
                Image image = Image.getInstance(bytes);
                float maxWidth = 460f;
                float maxHeight = 320f;
                image.scaleToFit(maxWidth, maxHeight);
                image.setAlignment(Element.ALIGN_CENTER);
                image.setBorder(Rectangle.BOX);
                image.setBorderColor(BORDER);
                image.setBorderWidth(1f);
                imageCell.addElement(image);
            } catch (Exception e) {
                Paragraph unavailable = new Paragraph(
                        "Image could not be loaded for this report (" + e.getMessage() + ").",
                        FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 9, DANGER)
                );
                imageCell.addElement(unavailable);
            }

            box.addCell(imageCell);
            document.add(box);
        }
    }

    private void addFooterNote(Document document) throws DocumentException {
        addSpacer(document, 16);
        addRule(document, BORDER, 0.6f, 0, 6);

        Font metaFont = FontFactory.getFont(FontFactory.HELVETICA, 8.5f, MUTED);
        Paragraph generated = new Paragraph(
                "Report generated at " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")),
                metaFont
        );
        document.add(generated);

        Paragraph system = new Paragraph("Generated by LegalMetriX Compliance Inspection System", metaFont);
        document.add(system);
    }

    // ---------------------------------------------------------------------
    // Small helpers
    // ---------------------------------------------------------------------

    private void addSectionHeader(Document document, String title) throws DocumentException {
        PdfPTable bar = new PdfPTable(1);
        bar.setWidthPercentage(100);
        bar.setSpacingBefore(4);
        bar.setSpacingAfter(6);

        PdfPCell cell = new PdfPCell(new Phrase(title, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, WHITE)));
        cell.setBackgroundColor(BRAND_TEAL_DARK);
        cell.setPadding(6);
        bar.addCell(cell);

        document.add(bar);
    }

    private PdfPTable newKeyValueTable() throws DocumentException {
        rowCounter.set(0);
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{34, 66});
        return table;
    }

    private final ThreadLocal<Integer> rowCounter = ThreadLocal.withInitial(() -> 0);

    private void addRow(PdfPTable table, String label, String val) {
        int index = rowCounter.get();
        boolean stripe = index % 2 == 1;
        rowCounter.set(index + 1);

        PdfPCell labelCell = new PdfPCell(new Phrase(label, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9.5f, MUTED)));
        labelCell.setPadding(6);
        labelCell.setBorderColor(BORDER);
        labelCell.setBackgroundColor(stripe ? STRIPE : WHITE);
        table.addCell(labelCell);

        PdfPCell valueCell = new PdfPCell(new Phrase(val, FontFactory.getFont(FontFactory.HELVETICA, 9.5f, INK)));
        valueCell.setPadding(6);
        valueCell.setBorderColor(BORDER);
        valueCell.setBackgroundColor(stripe ? STRIPE : WHITE);
        table.addCell(valueCell);
    }

    private Paragraph mutedNote(String text) {
        return new Paragraph(text, FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 9.5f, MUTED));
    }

    private void addSpacer(Document document, float height) throws DocumentException {
        Paragraph spacer = new Paragraph(" ");
        spacer.setSpacingBefore(0);
        spacer.setLeading(height);
        document.add(spacer);
    }

    private void addRule(Document document, Color color, float thickness, float before, float after) throws DocumentException {
        PdfPTable line = new PdfPTable(1);
        line.setWidthPercentage(100);
        PdfPCell cell = new PdfPCell();
        cell.setFixedHeight(thickness);
        cell.setBackgroundColor(color);
        cell.setBorder(Rectangle.NO_BORDER);
        line.addCell(cell);
        line.setSpacingBefore(before);
        line.setSpacingAfter(after);
        document.add(line);
    }

    private Color severityColor(Object severity) {
        String s = value(severity).toUpperCase();
        if (s.contains("CRITICAL") || s.contains("HIGH")) return DANGER;
        if (s.contains("MEDIUM") || s.contains("MODERATE")) return WARNING;
        return SUCCESS;
    }

    private Color severityBg(Object severity) {
        String s = value(severity).toUpperCase();
        if (s.contains("CRITICAL") || s.contains("HIGH")) return DANGER_BG;
        if (s.contains("MEDIUM") || s.contains("MODERATE")) return WARNING_BG;
        return SUCCESS_BG;
    }

    private String trimScore(double score) {
        if (score == Math.floor(score)) {
            return String.valueOf((int) score);
        }
        return String.valueOf(score);
    }

    private String value(Object value) {
        return value == null ? "Not provided" : value.toString();
    }

    /**
     * Draws a thin border frame around every page and a small "Page X of Y" footer,
     * giving the report a professional, bounded look instead of raw text on white.
     */
    private static class BorderAndFooterEvent extends PdfPageEventHelper {

        @Override
        public void onEndPage(PdfWriter writer, Document document) {
            Rectangle pageSize = document.getPageSize();
            com.lowagie.text.pdf.PdfContentByte canvas = writer.getDirectContent();

            canvas.saveState();
            canvas.setColorStroke(BORDER);
            canvas.setLineWidth(0.8f);
            canvas.rectangle(
                    pageSize.getLeft() + 18,
                    pageSize.getBottom() + 18,
                    pageSize.getWidth() - 36,
                    pageSize.getHeight() - 36
            );
            canvas.stroke();
            canvas.restoreState();

            Font pageFont = FontFactory.getFont(FontFactory.HELVETICA, 8, MUTED);
            com.lowagie.text.pdf.ColumnText.showTextAligned(
                    canvas,
                    Element.ALIGN_CENTER,
                    new Phrase("Page " + writer.getPageNumber(), pageFont),
                    (pageSize.getLeft() + pageSize.getRight()) / 2,
                    pageSize.getBottom() + 28,
                    0
            );
        }
    }
}
