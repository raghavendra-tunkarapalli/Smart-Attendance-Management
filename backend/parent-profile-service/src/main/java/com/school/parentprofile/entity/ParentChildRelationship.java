package com.school.parentprofile.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "parent_child_relationships")
public class ParentChildRelationship {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Foreign Key to users table for Parent
    @Column(name = "parent_user_id", nullable = false)
    private Long parentUserId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "parent_user_id", referencedColumnName = "id", insertable = false, updatable = false)
    private User parentUser;

    @Column(name = "parent_email")
    private String parentEmail;

    @Column(name = "parent_name")
    private String parentName;

    // Parent Unique ID (explicit persistent column)
    @Column(name = "parent_unique_id")
    private String parentUniqueId;

    // Foreign Key to users table for Student / Child
    @Column(name = "student_user_id")
    private Long studentUserId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_user_id", referencedColumnName = "id", insertable = false, updatable = false)
    private User studentUser;

    // Foreign Key reference to student_details table
    @Column(name = "student_details_id")
    private Long studentDetailsId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_details_id", referencedColumnName = "id", insertable = false, updatable = false)
    private StudentDetails studentDetails;

    // Student Unique ID (explicit persistent column e.g. ADM-24992, ADM-78578, ADM-1042)
    @Column(name = "student_unique_id")
    private String studentUniqueId;

    // Backward-compatible alias column
    @Column(name = "student_identity")
    private String studentIdentity;

    // Student Name (explicit persistent column)
    @Column(name = "student_name")
    private String studentName;

    // Backward-compatible alias column
    @Column(name = "child_name")
    private String childName;

    @Column(name = "class_name", nullable = false)
    private String className;

    @Column(name = "section", nullable = false)
    private String section;

    // Relationship type: Father, Mother, Legal Guardian, etc.
    @Column(name = "relationship_type", nullable = false)
    private String relationshipType;

    // Status: ACCEPTED, PENDING, REJECTED
    @Column(name = "status", nullable = false)
    private String status = "PENDING";

    @Column(name = "admin_remarks", length = 500)
    private String adminRemarks;

    @Column(name = "reviewed_by")
    private String reviewedBy;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public ParentChildRelationship() {}

    public ParentChildRelationship(Long parentUserId, Long studentUserId, Long studentDetailsId, String parentEmail, String parentName, String studentUniqueId, String studentName, String className, String section, String relationshipType, String status, String adminRemarks) {
        this.parentUserId = parentUserId;
        this.studentUserId = studentUserId;
        this.studentDetailsId = studentDetailsId;
        this.parentEmail = parentEmail;
        this.parentName = parentName;
        this.parentUniqueId = parentUserId != null ? String.valueOf(parentUserId) : null;
        this.studentUniqueId = studentUniqueId;
        this.studentIdentity = studentUniqueId;
        this.studentName = studentName;
        this.childName = studentName;
        this.className = className;
        this.section = section;
        this.relationshipType = relationshipType;
        this.status = status != null ? status : "PENDING";
        this.adminRemarks = adminRemarks;
        this.createdAt = LocalDateTime.now();
        syncFields();
    }

    public ParentChildRelationship(Long parentUserId, Long studentUserId, String parentEmail, String parentName, String studentIdentity, String childName, String className, String section, String relationshipType, String status, String adminRemarks) {
        this(parentUserId, studentUserId, null, parentEmail, parentName, studentIdentity, childName, className, section, relationshipType, status, adminRemarks);
    }

    public ParentChildRelationship(Long parentUserId, String parentEmail, String parentName, String studentIdentity, String childName, String className, String section, String relationshipType, String status, String adminRemarks) {
        this(parentUserId, null, null, parentEmail, parentName, studentIdentity, childName, className, section, relationshipType, status, adminRemarks);
    }

    @PrePersist
    @PreUpdate
    public void syncFields() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.status == null) {
            this.status = "PENDING";
        }
        if (this.parentUserId != null && (this.parentUniqueId == null || this.parentUniqueId.isBlank())) {
            this.parentUniqueId = String.valueOf(this.parentUserId);
        }
        if (this.parentUser != null) {
            if (this.parentUniqueId == null || this.parentUniqueId.isBlank()) {
                this.parentUniqueId = String.valueOf(this.parentUser.getId());
            }
            if (this.parentName == null || this.parentName.isBlank()) {
                this.parentName = this.parentUser.getFullName();
            }
            if (this.parentEmail == null || this.parentEmail.isBlank()) {
                this.parentEmail = this.parentUser.getEmail();
            }
        }
        if (this.studentDetails != null) {
            if (this.studentUniqueId == null || this.studentUniqueId.isBlank()) {
                this.studentUniqueId = this.studentDetails.getStudentId();
            }
            if (this.studentName == null || this.studentName.isBlank()) {
                this.studentName = this.studentDetails.getFullName();
            }
            if (this.parentName == null || this.parentName.isBlank()) {
                this.parentName = this.studentDetails.getParentName();
            }
            if (this.className == null || this.className.isBlank()) {
                this.className = this.studentDetails.getFormattedClass();
            }
            if (this.section == null || this.section.isBlank()) {
                this.section = this.studentDetails.getSectionName();
            }
        }
        if (this.studentIdentity == null || this.studentIdentity.isBlank()) {
            this.studentIdentity = this.studentUniqueId;
        }
        if (this.studentUniqueId == null || this.studentUniqueId.isBlank()) {
            this.studentUniqueId = this.studentIdentity;
        }
        if (this.childName == null || this.childName.isBlank()) {
            this.childName = this.studentName;
        }
        if (this.studentName == null || this.studentName.isBlank()) {
            this.studentName = this.childName;
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getParentUserId() { return parentUserId; }
    public void setParentUserId(Long parentUserId) { this.parentUserId = parentUserId; }

    public User getParentUser() { return parentUser; }
    public void setParentUser(User parentUser) { this.parentUser = parentUser; }

    public Long getStudentUserId() { return studentUserId; }
    public void setStudentUserId(Long studentUserId) { this.studentUserId = studentUserId; }

    public User getStudentUser() { return studentUser; }
    public void setStudentUser(User studentUser) { this.studentUser = studentUser; }

    public Long getStudentDetailsId() { return studentDetailsId; }
    public void setStudentDetailsId(Long studentDetailsId) { this.studentDetailsId = studentDetailsId; }

    public StudentDetails getStudentDetails() { return studentDetails; }
    public void setStudentDetails(StudentDetails studentDetails) { this.studentDetails = studentDetails; }

    /**
     * Parent Unique ID: returns parent user id or persistent column value
     */
    public String getParentUniqueId() {
        if (parentUniqueId != null && !parentUniqueId.isBlank()) {
            return parentUniqueId;
        }
        if (parentUserId != null) {
            return String.valueOf(parentUserId);
        }
        if (parentUser != null) {
            return parentUser.getUsername();
        }
        return null;
    }
    public void setParentUniqueId(String parentUniqueId) {
        this.parentUniqueId = parentUniqueId;
        if (parentUniqueId != null && this.parentUserId == null) {
            try {
                this.parentUserId = Long.parseLong(parentUniqueId);
            } catch (NumberFormatException ignored) {}
        }
    }

    /**
     * Parent Name: dynamically fetched from users table, student_details table, or persistent column
     */
    public String getParentName() {
        if (parentName != null && !parentName.isBlank()) {
            return parentName;
        }
        if (parentUser != null && parentUser.getFullName() != null && !parentUser.getFullName().isBlank()) {
            return parentUser.getFullName();
        }
        if (studentDetails != null && studentDetails.getParentName() != null && !studentDetails.getParentName().isBlank()) {
            return studentDetails.getParentName();
        }
        return parentName;
    }
    public void setParentName(String parentName) { this.parentName = parentName; }

    /**
     * Parent Email: dynamically fetched from users table
     */
    public String getParentEmail() {
        if (parentUser != null && parentUser.getEmail() != null) {
            return parentUser.getEmail();
        }
        return parentEmail;
    }
    public void setParentEmail(String parentEmail) { this.parentEmail = parentEmail; }

    /**
     * Student Unique ID: dynamically referenced from student_details table (student_id), persistent column, or student identity
     */
    public String getStudentUniqueId() {
        if (studentUniqueId != null && !studentUniqueId.isBlank()) {
            return studentUniqueId;
        }
        if (studentDetails != null && studentDetails.getStudentId() != null && !studentDetails.getStudentId().isBlank()) {
            return studentDetails.getStudentId();
        }
        if (studentIdentity != null && !studentIdentity.isBlank()) {
            return studentIdentity;
        }
        if (studentUser != null && studentUser.getUsername() != null) {
            return studentUser.getUsername();
        }
        return studentIdentity;
    }
    public void setStudentUniqueId(String studentUniqueId) {
        this.studentUniqueId = studentUniqueId;
        this.studentIdentity = studentUniqueId;
    }

    /**
     * Student Identity alias
     */
    public String getStudentIdentity() {
        return getStudentUniqueId();
    }
    public void setStudentIdentity(String studentIdentity) {
        this.studentIdentity = studentIdentity;
        this.studentUniqueId = studentIdentity;
    }

    /**
     * Student Name: dynamically referenced from student_details table, users table, or persistent column
     */
    public String getStudentName() {
        if (studentName != null && !studentName.isBlank()) {
            return studentName;
        }
        if (studentDetails != null && !studentDetails.getFullName().isBlank()) {
            return studentDetails.getFullName();
        }
        if (studentUser != null && !studentUser.getFullName().isBlank()) {
            return studentUser.getFullName();
        }
        return childName;
    }
    public void setStudentName(String studentName) {
        this.studentName = studentName;
        this.childName = studentName;
    }

    /**
     * Child Name alias
     */
    public String getChildName() {
        return getStudentName();
    }
    public void setChildName(String childName) {
        this.childName = childName;
        this.studentName = childName;
    }

    /**
     * Student Email: dynamically fetched from users table
     */
    public String getStudentEmail() {
        if (studentUser != null) {
            return studentUser.getEmail();
        }
        return null;
    }

    /**
     * Student Username: dynamically fetched from users table
     */
    public String getStudentUsername() {
        if (studentUser != null) {
            return studentUser.getUsername();
        }
        return null;
    }

    public String getClassName() {
        if (studentDetails != null && studentDetails.getClassStandard() != null) {
            return studentDetails.getFormattedClass();
        }
        return className;
    }
    public void setClassName(String className) { this.className = className; }

    public String getSection() {
        if (studentDetails != null && studentDetails.getSectionName() != null) {
            return studentDetails.getSectionName();
        }
        return section;
    }
    public void setSection(String section) { this.section = section; }

    public String getRelationshipType() { return relationshipType; }
    public void setRelationshipType(String relationshipType) { this.relationshipType = relationshipType; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAdminRemarks() { return adminRemarks; }
    public void setAdminRemarks(String adminRemarks) { this.adminRemarks = adminRemarks; }

    public String getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(String reviewedBy) { this.reviewedBy = reviewedBy; }

    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
