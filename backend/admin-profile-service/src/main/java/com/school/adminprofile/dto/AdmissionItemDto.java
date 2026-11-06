package com.school.adminprofile.dto;

public class AdmissionItemDto {
    private Long id;
    private String admissionId;
    private String studentName;
    private String className;
    private String section;
    private String parentName;
    private String parentEmail;
    private String status;
    private String createdAt;

    public AdmissionItemDto() {
    }

    public AdmissionItemDto(Long id, String admissionId, String studentName, String className,
                            String section, String parentName, String parentEmail,
                            String status, String createdAt) {
        this.id = id;
        this.admissionId = admissionId;
        this.studentName = studentName;
        this.className = className;
        this.section = section;
        this.parentName = parentName;
        this.parentEmail = parentEmail;
        this.status = status;
        this.createdAt = createdAt;
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

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
    }

    public String getSection() {
        return section;
    }

    public void setSection(String section) {
        this.section = section;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
}

