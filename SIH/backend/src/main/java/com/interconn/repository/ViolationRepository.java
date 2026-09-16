package com.interconn.repository;

import com.interconn.entity.Violation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ViolationRepository
        extends JpaRepository<Violation, UUID> {

    List<Violation> findByInspectionId(UUID inspectionId);

    void deleteByInspectionId(UUID inspectionId);
}