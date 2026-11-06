package com.school.teacherremarks.dto;

import jakarta.validation.constraints.NotBlank;

public class AcknowledgeRemarkRequest {

    @NotBlank(message = "Parent username is required")
    private String parentUsername;

    private String parentName;

    private String parentNotes; // e.g. "Thank you teacher, we will ensure student completes the workbook"

    public AcknowledgeRemarkRequest() {
    }

    public AcknowledgeRemarkRequest(String parentUsername, String parentName, String parentNotes) {
        this.parentUsername = parentUsername;
        this.parentName = parentName;
        this.parentNotes = parentNotes;
    }

    public String getParentUsername() {
        return parentUsername;
    }

    public void setParentUsername(String parentUsername) {
        this.parentUsername = parentUsername;
    }

    public String getParentName() {
        return parentName;
    }

    public void setParentName(String parentName) {
        this.parentName = parentName;
    }

    public String getParentNotes() {
        return parentNotes;
    }

    public void setParentNotes(String parentNotes) {
        this.parentNotes = parentNotes;
    }
}

