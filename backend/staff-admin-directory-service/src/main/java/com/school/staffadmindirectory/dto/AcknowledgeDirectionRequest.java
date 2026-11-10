package com.school.staffadmindirectory.dto;

public class AcknowledgeDirectionRequest {
    private String staffUsername;
    private String staffName;
    private String responseNote;
    private String status; // ACKNOWLEDGED, IN_PROGRESS, COMPLETED

    public AcknowledgeDirectionRequest() {}

    public String getStaffUsername() {
        return staffUsername;
    }

    public void setStaffUsername(String staffUsername) {
        this.staffUsername = staffUsername;
    }

    public String getStaffName() {
        return staffName;
    }

    public void setStaffName(String staffName) {
        this.staffName = staffName;
    }

    public String getResponseNote() {
        return responseNote;
    }

    public void setResponseNote(String responseNote) {
        this.responseNote = responseNote;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}

