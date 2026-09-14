package com.interconn.service;

import com.interconn.entity.Inspection;
import com.interconn.entity.Report;
import com.interconn.entity.User;
import com.interconn.repository.InspectionRepository;
import com.interconn.repository.ReportRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class ReportService {

    private final ReportRepository reportRepository;
    private final InspectionRepository inspectionRepository;
    private final PdfReportService pdfReportService;

    public ReportService(
            ReportRepository reportRepository,
            InspectionRepository inspectionRepository,
            PdfReportService pdfReportService) {

        this.reportRepository = reportRepository;
        this.inspectionRepository = inspectionRepository;
        this.pdfReportService = pdfReportService;
    }

    public String generateReport(
            UUID inspectionId,
            User supervisor) {

        Inspection inspection = inspectionRepository
                .findById(inspectionId)
                .orElseThrow(() ->
                        new RuntimeException("Inspection not found"));

        if (!inspection.getSupervisor().getId()
                .equals(supervisor.getId())) {

            throw new RuntimeException(
                    "You are not allowed to generate this report");
        }

        String reportPath =
                pdfReportService.generateReport(
                        inspectionId,
                        supervisor.getId()
                );

        Report report = new Report();

        report.setInspection(inspection);
        report.setGeneratedBy(supervisor);
        report.setReportUrl(reportPath);

        reportRepository.save(report);

        return reportPath;
    }

    public List<Report> getReports(
            UUID inspectionId,
            User supervisor) {

        Inspection inspection = inspectionRepository
                .findById(inspectionId)
                .orElseThrow(() ->
                        new RuntimeException("Inspection not found"));

        if (!inspection.getSupervisor().getId()
                .equals(supervisor.getId())) {

            throw new RuntimeException(
                    "You are not allowed to access this inspection");
        }

        return reportRepository.findByInspectionId(
                inspectionId
        );
    }
}