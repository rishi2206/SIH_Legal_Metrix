package com.interconn.service;

import com.interconn.entity.Evidence;
import com.interconn.entity.Inspection;
import com.interconn.integration.OcrClient;
import com.interconn.integration.OcrResult;
import com.interconn.repository.EvidenceRepository;
import com.interconn.repository.InspectionRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class OcrService {

    private final InspectionRepository inspectionRepository;
    private final EvidenceRepository evidenceRepository;
    private final OcrClient ocrClient;

    public OcrService(
            InspectionRepository inspectionRepository,
            EvidenceRepository evidenceRepository,
            OcrClient ocrClient) {

        this.inspectionRepository = inspectionRepository;
        this.evidenceRepository = evidenceRepository;
        this.ocrClient = ocrClient;
    }

    public void processInspection(
            UUID inspectionId,
            UUID supervisorId) {

        Inspection inspection =
                inspectionRepository.findById(inspectionId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Inspection not found"));

        // Ownership check
        if (!inspection.getSupervisor().getId()
                .equals(supervisorId)) {

            throw new RuntimeException(
                    "You are not allowed to process this inspection");
        }

        List<Evidence> evidenceList =
                evidenceRepository.findByInspectionId(
                        inspectionId);

        if (evidenceList.isEmpty()) {
            throw new RuntimeException(
                    "No evidence found for this inspection");
        }

        for (Evidence evidence : evidenceList) {

            OcrResult result =
                    ocrClient.process(evidence);

            evidence.setOcrText(
                    result.getRawText());

            evidenceRepository.save(evidence);
        }
    }
}