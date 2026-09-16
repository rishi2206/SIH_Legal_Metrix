package com.interconn.controller;

import com.interconn.dto.ReportResponse;
import com.interconn.entity.Report;
import com.interconn.entity.User;
import com.interconn.repository.UserRepository;
import com.interconn.service.ReportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/inspections")
public class ReportController {

    private final ReportService reportService;
    private final UserRepository userRepository;

    public ReportController(
            ReportService reportService,
            UserRepository userRepository) {

        this.reportService = reportService;
        this.userRepository = userRepository;
    }

    @PostMapping("/{inspectionId}/report")
    public ResponseEntity<ReportResponse> generateReport(
            @PathVariable UUID inspectionId,
            Authentication authentication) {

        UUID supervisorId =
                UUID.fromString(authentication.getName());

        User supervisor = userRepository.findById(supervisorId)
                .orElseThrow(() ->
                        new RuntimeException("Supervisor not found"));

        String reportPath =
                reportService.generateReport(
                        inspectionId,
                        supervisor
                );

        List<Report> reports =
                reportService.getReports(
                        inspectionId,
                        supervisor
                );

        Report latestReport =
                reports.get(reports.size() - 1);

        return ResponseEntity.ok(
                new ReportResponse(
                        latestReport.getId(),
                        latestReport.getInspection().getId(),
                        latestReport.getGeneratedBy().getId(),
                        reportPath,
                        latestReport.getGeneratedAt()
                )
        );
    }

    @GetMapping("/{inspectionId}/report")
    public ResponseEntity<List<ReportResponse>> getReports(
            @PathVariable UUID inspectionId,
            Authentication authentication) {

        UUID supervisorId =
                UUID.fromString(authentication.getName());

        User supervisor = userRepository.findById(supervisorId)
                .orElseThrow(() ->
                        new RuntimeException("Supervisor not found"));

        List<ReportResponse> responses =
                reportService
                        .getReports(inspectionId, supervisor)
                        .stream()
                        .map(report -> new ReportResponse(
                                report.getId(),
                                report.getInspection().getId(),
                                report.getGeneratedBy().getId(),
                                report.getReportUrl(),
                                report.getGeneratedAt()
                        ))
                        .toList();

        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{inspectionId}/report/{reportId}/download")
    public ResponseEntity<byte[]> downloadReport(
            @PathVariable UUID inspectionId,
            @PathVariable UUID reportId,
            Authentication authentication) {

        UUID userId =
                UUID.fromString(authentication.getName());

        User requester = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Report report = reportService.getReportById(reportId, requester);

        if (!report.getInspection().getId().equals(inspectionId)) {
            throw new RuntimeException("Report does not belong to this inspection");
        }

        byte[] pdfBytes = reportService.downloadReportBytes(report);
        String filename = "inspection-report-" + inspectionId + ".pdf";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}