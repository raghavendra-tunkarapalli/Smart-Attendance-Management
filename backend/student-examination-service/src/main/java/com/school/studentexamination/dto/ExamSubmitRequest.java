package com.school.studentexamination.dto;

import java.util.Map;

public class ExamSubmitRequest {
    private String studentUsername;
    private String studentName;
    private Long assignmentId;
    private Map<String, String> answers; // questionNumber -> selectedOption (e.g. {"1": "A", "2": "C"})

    public ExamSubmitRequest() {}

    public String getStudentUsername() { return studentUsername; }
    public void setStudentUsername(String studentUsername) { this.studentUsername = studentUsername; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public Long getAssignmentId() { return assignmentId; }
    public void setAssignmentId(Long assignmentId) { this.assignmentId = assignmentId; }

    public Map<String, String> getAnswers() { return answers; }
    public void setAnswers(Map<String, String> answers) { this.answers = answers; }
}
