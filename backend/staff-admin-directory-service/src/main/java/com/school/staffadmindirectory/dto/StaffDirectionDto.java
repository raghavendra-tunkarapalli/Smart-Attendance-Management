package com.school.staffadmindirectory.dto;

import java.time.LocalDateTime;

public class StaffDirectionDto {
    private Long id;
    private String directionCode;
    private String title;
    private String instruction;
    private String targetType;
    private String targetStaffCode;
    private String targetStaffName;
    private String targetDepartment;
    private String priority;
    private String status;
    private String dueDate;
    private String issuedBy;
    private LocalDateTime createdAt;
    private String formattedCreatedAt;
    private boolean isDirectTarget;
    private Boolean acknowledged;
    private String acknowledgedAt;
    private String formattedAcknowledgedAt;
    private String acknowledgedBy;
    private String staffResponseNote;

    public StaffDirectionDto() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDirectionCode() {
        return directionCode;
    }

    public void setDirectionCode(String directionCode) {
        this.directionCode = directionCode;
    }

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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getFormattedCreatedAt() {
        return formattedCreatedAt;
    }

    public void setFormattedCreatedAt(String formattedCreatedAt) {
        this.formattedCreatedAt = formattedCreatedAt;
    }

    public boolean isDirectTarget() {
        return isDirectTarget;
    }

    public void setDirectTarget(boolean directTarget) {
        isDirectTarget = directTarget;
    }

    public Boolean getAcknowledged() {
        return acknowledged != null && acknowledged;
    }

    public void setAcknowledged(Boolean acknowledged) {
        this.acknowledged = acknowledged;
    }

    public String getAcknowledgedAt() {
        return acknowledgedAt;
    }

    public void setAcknowledgedAt(String acknowledgedAt) {
        this.acknowledgedAt = acknowledgedAt;
    }

    public String getFormattedAcknowledgedAt() {
        return formattedAcknowledgedAt;
    }

    public void setFormattedAcknowledgedAt(String formattedAcknowledgedAt) {
        this.formattedAcknowledgedAt = formattedAcknowledgedAt;
    }

    public String getAcknowledgedBy() {
        return acknowledgedBy;
    }

    public void setAcknowledgedBy(String acknowledgedBy) {
        this.acknowledgedBy = acknowledgedBy;
    }

    public String getStaffResponseNote() {
        return staffResponseNote;
    }

    public void setStaffResponseNote(String staffResponseNote) {
        this.staffResponseNote = staffResponseNote;
    }
}

