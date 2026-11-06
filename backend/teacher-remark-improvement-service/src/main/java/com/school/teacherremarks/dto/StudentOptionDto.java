package com.school.teacherremarks.dto;

public class StudentOptionDto {
    private String studentId;
    private String studentName;
    private String classStandard;
    private String section;
    private String parentName;
    private String parentUsername;
    private String parentPhone;

    public StudentOptionDto() {
    }

    public StudentOptionDto(String studentId, String studentName, String classStandard, String section, String parentName, String parentUsername, String parentPhone) {
        this.studentId = studentId;
        this.studentName = studentName;
        this.classStandard = classStandard;
        this.section = section;
        this.parentName = parentName;
        this.parentUsername = parentUsername;
        this.parentPhone = parentPhone;
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

    public String getParentName() {
        return parentName;
    }

    public void setParentName(String parentName) {
        this.parentName = parentName;
    }

    public String getParentUsername() {
        return parentUsername;
    }

    public void setParentUsername(String parentUsername) {
        this.parentUsername = parentUsername;
    }

    public String getParentPhone() {
        return parentPhone;
    }

    public void setParentPhone(String parentPhone) {
        this.parentPhone = parentPhone;
    }
}

