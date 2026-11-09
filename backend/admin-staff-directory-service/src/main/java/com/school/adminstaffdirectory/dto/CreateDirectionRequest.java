package com.school.adminstaffdirectory.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateDirectionRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Instruction content is required")
    private String instruction;

    private String targetType; // ALL_STAFF or INDIVIDUAL

    private String targetStaffCode; // "ALL" or staffCode

    private String targetStaffName;

    private String targetDepartment;

    private String priority; // URGENT, HIGH, NORMAL, LOW

    private String dueDate;

    private String issuedBy;

    public CreateDirectionRequest() {}

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getInstruction() {
        return instruction;
    }

    public void setInstruction(String instruction) {
        this.instruction = instruction;
    }

    public String getTargetType() {
        return targetType;
    }

    public void setTargetType(String targetType) {
        this.targetType = targetType;
    }

    public String getTargetStaffCode() {
        return targetStaffCode;
    }

    public void setTargetStaffCode(String targetStaffCode) {
        this.targetStaffCode = targetStaffCode;
    }

    public String getTargetStaffName() {
        return targetStaffName;
    }

    public void setTargetStaffName(String targetStaffName) {
        this.targetStaffName = targetStaffName;
    }

    public String getTargetDepartment() {
        return targetDepartment;
    }

    public void setTargetDepartment(String targetDepartment) {
        this.targetDepartment = targetDepartment;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getDueDate() {
        return dueDate;
    }

    public void setDueDate(String dueDate) {
        this.dueDate = dueDate;
    }

    public String getIssuedBy() {
        return issuedBy;
    }

    public void setIssuedBy(String issuedBy) {
        this.issuedBy = issuedBy;
    }
}

