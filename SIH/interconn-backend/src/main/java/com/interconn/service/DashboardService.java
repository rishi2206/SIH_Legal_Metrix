package com.interconn.service;

import com.interconn.dto.DashboardResponse;
import com.interconn.entity.ComplianceResult;
import com.interconn.entity.InspectionStatus;
import com.interconn.entity.Role;
import com.interconn.repository.InspectionRepository;
import com.interconn.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class DashboardService {

    private final InspectionRepository inspectionRepository;
    private final UserRepository userRepository;

    public DashboardService(
            InspectionRepository inspectionRepository,
            UserRepository userRepository) {

        this.inspectionRepository = inspectionRepository;
        this.userRepository = userRepository;
    }

    public DashboardResponse getSupervisorDashboard(UUID supervisorId) {

        long totalInspections =
                inspectionRepository.countBySupervisorId(supervisorId);

        long compliantInspections =
                inspectionRepository.countBySupervisorIdAndOverallResult(
                        supervisorId,
                        ComplianceResult.COMPLIANT
                );

        long nonCompliantInspections =
                inspectionRepository.countBySupervisorIdAndOverallResult(
                        supervisorId,
                        ComplianceResult.NON_COMPLIANT
                );

        long processingInspections =
                inspectionRepository.countBySupervisorIdAndStatus(
                        supervisorId,
                        InspectionStatus.PROCESSING
                );

        return new DashboardResponse(
                totalInspections,
                compliantInspections,
                nonCompliantInspections,
                processingInspections,
                0
        );
    }

    public DashboardResponse getAdminDashboard(UUID adminId) {

        long totalSupervisors =
                userRepository.countByAdminIdAndRole(
                        adminId,
                        Role.SUPERVISOR
                );

        long totalInspections =
                inspectionRepository.countBySupervisorAdminId(adminId);

        long compliantInspections =
                inspectionRepository
                        .countBySupervisorAdminIdAndOverallResult(
                                adminId,
                                ComplianceResult.COMPLIANT
                        );

        long nonCompliantInspections =
                inspectionRepository
                        .countBySupervisorAdminIdAndOverallResult(
                                adminId,
                                ComplianceResult.NON_COMPLIANT
                        );

        long processingInspections =
                inspectionRepository
                        .countBySupervisorAdminIdAndStatus(
                                adminId,
                                InspectionStatus.PROCESSING
                        );

        return new DashboardResponse(
                totalInspections,
                compliantInspections,
                nonCompliantInspections,
                processingInspections,
                totalSupervisors
        );
    }
}