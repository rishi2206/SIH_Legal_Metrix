package com.interconn.repository;

import com.interconn.entity.Extraction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ExtractionRepository extends JpaRepository<Extraction, UUID> {

    Optional<Extraction> findByInspectionId(UUID inspectionId);
}