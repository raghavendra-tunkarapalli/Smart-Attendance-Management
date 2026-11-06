package com.school.adminprofile.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "admissions")
public class StudentAdmissionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "admission_id", nullable = false)
    private String admissionId;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(name = "child_name")
    private String childName;

    @Column(name = "applicant_type")
    private String applicantType;

    @Column(name = "class_name", nullable = false)
    private String className;

    @Column(name = "parent_name", nullable = false)
    private String parentName;

    @Column(name = "parent_email", nullable = false)
    private String parentEmail;

    @Column(name = "section")
    private String section = "A";

    @Column(name = "status")
    private String status = "PENDING";

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public StudentAdmissionEntity() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAdmissionId() {
        return admissionId;
    }

    public void setAdmissionId(String admissionId) {
        this.admissionId = admissionId;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getChildName() {
        return childName;
    }

    public void setChildName(String childName) {
        this.childName = childName;
    }

    public String getApplicantType() {
        return applicantType;
    }

    public void setApplicantType(String applicantType) {
        this.applicantType = applicantType;
    }

    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
    }

    public String getParentName() {
        return parentName;
    }

    public void setParentName(String parentName) {
        this.parentName = parentName;
    }

    public String getParentEmail() {
        return parentEmail;
    }

    public void setParentEmail(String parentEmail) {
        this.parentEmail = parentEmail;
    }

    public String getSection() {
        return section;
    }

    public void setSection(String section) {
        this.section = section;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getResolvedStudentName() {
        if (childName != null && !childName.trim().isEmpty()) {
            return childName.trim();
        }
        String first = firstName != null ? firstName.trim() : "";
        String last = lastName != null ? lastName.trim() : "";
        return (first + " " + last).trim();
    }
}
