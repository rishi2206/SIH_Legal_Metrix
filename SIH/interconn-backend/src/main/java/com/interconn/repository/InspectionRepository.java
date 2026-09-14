package com.interconn.repository;

import com.interconn.entity.ComplianceResult;
import com.interconn.entity.Inspection;
import com.interconn.entity.InspectionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface InspectionRepository extends JpaRepository<Inspection, UUID> {

    List<Inspection> findBySupervisorId(UUID supervisorId);

    List<Inspection> findBySupervisorAdminId(UUID adminId);

    long countBySupervisorId(UUID supervisorId);

    long countBySupervisorIdAndOverallResult(
            UUID supervisorId,
            ComplianceResult overallResult
    );

    long countBySupervisorIdAndStatus(
            UUID supervisorId,
            InspectionStatus status
    );

    long countBySupervisorAdminId(UUID adminId);

    long countBySupervisorAdminIdAndOverallResult(
            UUID adminId,
            ComplianceResult overallResult
    );

    long countBySupervisorAdminIdAndStatus(
            UUID adminId,
            InspectionStatus status
    );
}