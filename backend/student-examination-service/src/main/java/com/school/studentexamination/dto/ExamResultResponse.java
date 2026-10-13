package com.school.studentexamination.dto;

import java.time.LocalDateTime;

public class ExamResultResponse {
    private Long submissionId;
    private Long assignmentId;
    private String assignmentTitle;
    private String subject;
    private Integer classStandard;
    private String sectionName;
    private String conductDate;
    private Integer totalQuestions;
    private Integer attemptedQuestions;
    private Integer correctAnswers;
    private Double score;
    private Double totalMarks;
    private Double percentage;
    private String status; // "ATTEMPTED", "UNATTEMPTED"
    private String remarks;
    private LocalDateTime submittedAt;
    private boolean resultsReleased;

    public ExamResultResponse() {}

    public Long getSubmissionId() { return submissionId; }
    public void setSubmissionId(Long submissionId) { this.submissionId = submissionId; }

    public Long getAssignmentId() { return assignmentId; }
    public void setAssignmentId(Long assignmentId) { this.assignmentId = assignmentId; }

    public String getAssignmentTitle() { return assignmentTitle; }
    public void setAssignmentTitle(String assignmentTitle) { this.assignmentTitle = assignmentTitle; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public Integer getClassStandard() { return classStandard; }
    public void setClassStandard(Integer classStandard) { this.classStandard = classStandard; }

    public String getSectionName() { return sectionName; }
    public void setSectionName(String sectionName) { this.sectionName = sectionName; }

    public String getConductDate() { return conductDate; }
    public void setConductDate(String conductDate) { this.conductDate = conductDate; }

    public Integer getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(Integer totalQuestions) { this.totalQuestions = totalQuestions; }

    public Integer getAttemptedQuestions() { return attemptedQuestions; }
    public void setAttemptedQuestions(Integer attemptedQuestions) { this.attemptedQuestions = attemptedQuestions; }

    public Integer getCorrectAnswers() { return correctAnswers; }
    public void setCorrectAnswers(Integer correctAnswers) { this.correctAnswers = correctAnswers; }

    public Double getScore() { return score; }
    public void setScore(Double score) { this.score = score; }

    public Double getTotalMarks() { return totalMarks; }
    public void setTotalMarks(Double totalMarks) { this.totalMarks = totalMarks; }

    public Double getPercentage() { return percentage; }
    public void setPercentage(Double percentage) { this.percentage = percentage; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }

    public boolean isResultsReleased() { return resultsReleased; }
    public void setResultsReleased(boolean resultsReleased) { this.resultsReleased = resultsReleased; }
}
