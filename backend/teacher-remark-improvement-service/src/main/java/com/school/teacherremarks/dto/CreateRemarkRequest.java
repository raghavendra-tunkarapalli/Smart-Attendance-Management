package com.school.teacherremarks.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateRemarkRequest {

    private String teacherUsername;
    private String teacherName;
    private String teacherEmail;

    @NotBlank(message = "Student ID is required")
    private String studentId;

    private String studentName;
    private String classStandard;
    private String section;

    private String parentUsername;
    private String parentName;
    private String parentPhone;

    @NotBlank(message = "Subject is required")
    private String subject;

    @NotBlank(message = "Category is required")
    private String category; // ACADEMIC_PROGRESS, HOMEWORK_ASSIGNMENTS, CONCEPTUAL_UNDERSTANDING, CLASS_ATTENTIVENESS, EXAM_PREPARATION, PRAISE

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Improvement suggestions are required")
    private String improvementSuggestions;

    private String severity; // PRAISE, INFO, ATTENTION_NEEDED, URGENT

    public CreateRemarkRequest() {
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
}

