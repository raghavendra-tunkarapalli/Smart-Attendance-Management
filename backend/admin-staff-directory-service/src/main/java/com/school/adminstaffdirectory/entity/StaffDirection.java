package com.school.adminstaffdirectory.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "admin_staff_directions")
public class StaffDirection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "direction_code", unique = true, nullable = false, length = 50)
    private String directionCode;

    @Column(name = "title", nullable = false, length = 250)
    private String title;

    @Column(name = "instruction", columnDefinition = "TEXT", nullable = false)
    private String instruction;

    @Column(name = "target_type", nullable = false, length = 50)
    private String targetType; // ALL_STAFF or INDIVIDUAL

    @Column(name = "target_staff_code", length = 50)
    private String targetStaffCode; // "ALL" or staffCode

    @Column(name = "target_staff_name", length = 150)
    private String targetStaffName;

    @Column(name = "target_department", length = 150)
    private String targetDepartment;

    @Column(name = "priority", length = 30)
    private String priority; // URGENT, HIGH, NORMAL, LOW

    @Column(name = "status", length = 30)
    private String status; // ACTIVE, ACKNOWLEDGED, COMPLETED, CANCELLED

    @Column(name = "due_date", length = 50)
    private String dueDate;

    @Column(name = "issued_by", length = 100)
    private String issuedBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "acknowledged")
    private Boolean acknowledged = false;

    @Column(name = "acknowledged_at")
    private LocalDateTime acknowledgedAt;

    @Column(name = "acknowledged_by", length = 100)
    private String acknowledgedBy;

    @Column(name = "staff_response_note", columnDefinition = "TEXT")
    private String staffResponseNote;

    @Transient
    private static final java.time.format.DateTimeFormatter FORMATTER = java.time.format.DateTimeFormatter.ofPattern("MMM dd, yyyy, hh:mm a");

    public StaffDirection() {}

    public StaffDirection(String directionCode, String title, String instruction, String targetType,
                          String targetStaffCode, String targetStaffName, String targetDepartment,
                          String priority, String status, String dueDate, String issuedBy) {
        this.directionCode = directionCode;
        this.title = title;
        this.instruction = instruction;
        this.targetType = targetType;
        this.targetStaffCode = targetStaffCode;
        this.targetStaffName = targetStaffName;
        this.targetDepartment = targetDepartment;
        this.priority = priority;
        this.status = status;
        this.dueDate = dueDate;
        this.issuedBy = issuedBy;
    }

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = "ACTIVE";
        }
        if (this.priority == null) {
            this.priority = "NORMAL";
        }
        if (this.targetType == null) {
            this.targetType = "ALL_STAFF";
        }
        if (this.acknowledged == null) {
            this.acknowledged = false;
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
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

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Boolean getAcknowledged() {
        if ("ALL_STAFF".equalsIgnoreCase(this.targetType)) {
            return false;
        }
        return acknowledged != null && acknowledged;
    }

    public void setAcknowledged(Boolean acknowledged) {
        this.acknowledged = acknowledged;
    }

    public LocalDateTime getAcknowledgedAt() {
        if ("ALL_STAFF".equalsIgnoreCase(this.targetType)) {
            return null;
        }
        return acknowledgedAt;
    }

    public void setAcknowledgedAt(LocalDateTime acknowledgedAt) {
        this.acknowledgedAt = acknowledgedAt;
    }

    public String getAcknowledgedBy() {
        if ("ALL_STAFF".equalsIgnoreCase(this.targetType)) {
            return null;
        }
        return acknowledgedBy;
    }

    public void setAcknowledgedBy(String acknowledgedBy) {
        this.acknowledgedBy = acknowledgedBy;
    }

    public String getStaffResponseNote() {
        if ("ALL_STAFF".equalsIgnoreCase(this.targetType)) {
            return null;
        }
        return staffResponseNote;
    }

    public void setStaffResponseNote(String staffResponseNote) {
        this.staffResponseNote = staffResponseNote;
    }

    public String getFormattedCreatedAt() {
        if (this.createdAt != null) {
            return this.createdAt.format(FORMATTER);
        }
        return null;
    }

    public String getFormattedAcknowledgedAt() {
        if ("ALL_STAFF".equalsIgnoreCase(this.targetType)) {
            return null;
        }
        if (this.acknowledgedAt != null) {
            return this.acknowledgedAt.format(FORMATTER);
        }
        return null;
    }
}

