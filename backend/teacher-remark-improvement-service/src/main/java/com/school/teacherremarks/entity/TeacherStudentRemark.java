package com.school.teacherremarks.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "teacher_student_remarks")
public class TeacherStudentRemark {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "teacher_username", nullable = false, length = 150)
    private String teacherUsername;

    @Column(name = "teacher_name", nullable = false, length = 255)
    private String teacherName;

    @Column(name = "teacher_email", length = 255)
    private String teacherEmail;

    @Column(name = "student_id", nullable = false, length = 100)
    private String studentId;

    @Column(name = "student_name", nullable = false, length = 255)
    private String studentName;

    @Column(name = "class_standard", nullable = false, length = 100)
    private String classStandard;

    @Column(name = "section", nullable = false, length = 50)
    private String section;

    @Column(name = "parent_username", length = 150)
    private String parentUsername;

    @Column(name = "parent_name", length = 255)
    private String parentName;

    @Column(name = "parent_phone", length = 50)
    private String parentPhone;

    @Column(name = "subject", nullable = false, length = 100)
    private String subject;

    @Column(name = "category", nullable = false, length = 100)
    private String category; // ACADEMIC_PROGRESS, HOMEWORK_ASSIGNMENTS, CONCEPTUAL_UNDERSTANDING, CLASS_ATTENTIVENESS, EXAM_PREPARATION, PRAISE

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Lob
    @Column(name = "description", nullable = false, columnDefinition = "LONGTEXT")
    private String description;

    @Lob
    @Column(name = "improvement_suggestions", nullable = false, columnDefinition = "LONGTEXT")
    private String improvementSuggestions;

    @Column(name = "severity", nullable = false, length = 50)
    private String severity; // PRAISE, INFO, ATTENTION_NEEDED, URGENT

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "acknowledged", nullable = false)
    private Boolean acknowledged = false;

    @Column(name = "acknowledged_at")
    private LocalDateTime acknowledgedAt;

    @Column(name = "acknowledged_by", length = 255)
    private String acknowledgedBy;

    @Lob
    @Column(name = "parent_feedback", columnDefinition = "TEXT")
    private String parentFeedback;

    public TeacherStudentRemark() {
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.updatedAt == null) {
            this.updatedAt = LocalDateTime.now();
        }
        if (this.acknowledged == null) {
            this.acknowledged = false;
        }
        if (this.severity == null) {
            this.severity = "ATTENTION_NEEDED";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTeacherUsername() {
        return teacherUsername;
    }

    public void setTeacherUsername(String teacherUsername) {
        this.teacherUsername = teacherUsername;
    }

    public String getTeacherName() {
        return teacherName;
    }

    public void setTeacherName(String teacherName) {
        this.teacherName = teacherName;
    }

    public String getTeacherEmail() {
        return teacherEmail;
    }

    public void setTeacherEmail(String teacherEmail) {
        this.teacherEmail = teacherEmail;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getClassStandard() {
        return classStandard;
    }

    public void setClassStandard(String classStandard) {
        this.classStandard = classStandard;
    }

    public String getSection() {
        return section;
    }

    public void setSection(String section) {
        this.section = section;
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

    public String getParentPhone() {
        return parentPhone;
    }

    public void setParentPhone(String parentPhone) {
        this.parentPhone = parentPhone;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImprovementSuggestions() {
        return improvementSuggestions;
    }

    public void setImprovementSuggestions(String improvementSuggestions) {
        this.improvementSuggestions = improvementSuggestions;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
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
        return acknowledged;
    }

    public void setAcknowledged(Boolean acknowledged) {
        this.acknowledged = acknowledged;
    }

    public LocalDateTime getAcknowledgedAt() {
        return acknowledgedAt;
    }

    public void setAcknowledgedAt(LocalDateTime acknowledgedAt) {
        this.acknowledgedAt = acknowledgedAt;
    }

    public String getAcknowledgedBy() {
        return acknowledgedBy;
    }

    public void setAcknowledgedBy(String acknowledgedBy) {
        this.acknowledgedBy = acknowledgedBy;
    }

    public String getParentFeedback() {
        return parentFeedback;
    }

    public void setParentFeedback(String parentFeedback) {
        this.parentFeedback = parentFeedback;
    }
}

