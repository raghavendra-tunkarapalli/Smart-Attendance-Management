package com.school.teacherremarks.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "remark_acknowledgments")
public class RemarkAcknowledgment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "remark_id", nullable = false)
    private Long remarkId;

    @Column(name = "student_id", nullable = false, length = 100)
    private String studentId;

    @Column(name = "parent_username", nullable = false, length = 150)
    private String parentUsername;

    @Column(name = "parent_name", nullable = false, length = 255)
    private String parentName;

    @Lob
    @Column(name = "parent_notes", columnDefinition = "TEXT")
    private String parentNotes;

    @Column(name = "acknowledged_at", nullable = false)
    private LocalDateTime acknowledgedAt;

    @Column(name = "action_status", nullable = false, length = 50)
    private String actionStatus = "CONFIRMED";

    public RemarkAcknowledgment() {
    }

    public RemarkAcknowledgment(Long remarkId, String studentId, String parentUsername, String parentName, String parentNotes) {
        this.remarkId = remarkId;
        this.studentId = studentId;
        this.parentUsername = parentUsername;
        this.parentName = parentName;
        this.parentNotes = parentNotes;
        this.acknowledgedAt = LocalDateTime.now();
        this.actionStatus = "CONFIRMED";
    }

    @PrePersist
    protected void onCreate() {
        if (this.acknowledgedAt == null) {
            this.acknowledgedAt = LocalDateTime.now();
        }
        if (this.actionStatus == null) {
            this.actionStatus = "CONFIRMED";
        }
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getRemarkId() {
        return remarkId;
    }

    public void setRemarkId(Long remarkId) {
        this.remarkId = remarkId;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
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

    public LocalDateTime getAcknowledgedAt() {
        return acknowledgedAt;
    }

    public void setAcknowledgedAt(LocalDateTime acknowledgedAt) {
        this.acknowledgedAt = acknowledgedAt;
    }

    public String getActionStatus() {
        return actionStatus;
    }

    public void setActionStatus(String actionStatus) {
        this.actionStatus = actionStatus;
    }
}

