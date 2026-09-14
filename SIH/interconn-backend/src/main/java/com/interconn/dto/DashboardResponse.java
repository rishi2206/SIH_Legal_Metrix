package com.interconn.dto;

public class DashboardResponse {

    private long totalInspections;
    private long compliantInspections;
    private long nonCompliantInspections;
    private long processingInspections;
    private long totalSupervisors;

    public DashboardResponse(
            long totalInspections,
            long compliantInspections,
            long nonCompliantInspections,
            long processingInspections,
            long totalSupervisors) {

        this.totalInspections = totalInspections;
        this.compliantInspections = compliantInspections;
        this.nonCompliantInspections = nonCompliantInspections;
        this.processingInspections = processingInspections;
        this.totalSupervisors = totalSupervisors;
    }

    public long getTotalInspections() {
        return totalInspections;
    }

    public long getCompliantInspections() {
        return compliantInspections;
    }

    public long getNonCompliantInspections() {
        return nonCompliantInspections;
    }

    public long getProcessingInspections() {
        return processingInspections;
    }

    public long getTotalSupervisors() {
        return totalSupervisors;
    }
}