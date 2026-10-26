package com.school.parentprofile.dto;

import jakarta.validation.constraints.NotBlank;

public class StatusUpdateRequest {

    @NotBlank(message = "Status is required (ACCEPTED, REJECTED, PENDING)")
    private String status;

    private String adminRemarks;
    private String reviewedBy;

    public StatusUpdateRequest() {}

    public StatusUpdateRequest(String status, String adminRemarks, String reviewedBy) {
        this.status = status;
        this.adminRemarks = adminRemarks;
        this.reviewedBy = reviewedBy;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAdminRemarks() { return adminRemarks; }
    public void setAdminRemarks(String adminRemarks) { this.adminRemarks = adminRemarks; }

    public String getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(String reviewedBy) { this.reviewedBy = reviewedBy; }
}
