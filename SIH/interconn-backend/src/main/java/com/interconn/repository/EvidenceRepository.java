package com.interconn.repository;

import com.interconn.entity.Evidence;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface EvidenceRepository extends JpaRepository<Evidence, UUID> {

    List<Evidence> findByInspectionId(UUID inspectionId);

    List<Evidence> findByProductId(UUID productId);
}