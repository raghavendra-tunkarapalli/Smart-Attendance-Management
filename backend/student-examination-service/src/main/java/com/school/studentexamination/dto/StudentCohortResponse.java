package com.school.studentexamination.dto;

public class StudentCohortResponse {
    private String studentUsername;
    private String studentName;
    private String studentId;
    private Integer classStandard;
    private String sectionName;

    public StudentCohortResponse() {}

    public StudentCohortResponse(String studentUsername, String studentName, String studentId, Integer classStandard, String sectionName) {
        this.studentUsername = studentUsername;
        this.studentName = studentName;
        this.studentId = studentId;
        this.classStandard = classStandard;
        this.sectionName = sectionName;
    }

    public String getStudentUsername() { return studentUsername; }
    public void setStudentUsername(String studentUsername) { this.studentUsername = studentUsername; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public Integer getClassStandard() { return classStandard; }
    public void setClassStandard(Integer classStandard) { this.classStandard = classStandard; }

    public String getSectionName() { return sectionName; }
    public void setSectionName(String sectionName) { this.sectionName = sectionName; }
}
