package com.school.parentchildacademic.dto;

public class ChildExamDto {
    private Long id;
    private String assignmentTitle;
    private String subject;
    private Integer classStandard;
    private String sectionName;
    private String conductDate;
    private Integer totalQuestions;
    private Boolean hasAttempted;
    private String attemptStatus;
    private Boolean resultsReleased;
    private Double score;
    private Double totalMarks;
    private Double percentage;

    public ChildExamDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

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

    public Boolean getHasAttempted() { return hasAttempted; }
    public void setHasAttempted(Boolean hasAttempted) { this.hasAttempted = hasAttempted; }

    public String getAttemptStatus() { return attemptStatus; }
    public void setAttemptStatus(String attemptStatus) { this.attemptStatus = attemptStatus; }

    public Boolean getResultsReleased() { return resultsReleased; }
    public void setResultsReleased(Boolean resultsReleased) { this.resultsReleased = resultsReleased; }

    public Double getScore() { return score; }
    public void setScore(Double score) { this.score = score; }

    public Double getTotalMarks() { return totalMarks; }
    public void setTotalMarks(Double totalMarks) { this.totalMarks = totalMarks; }

    public Double getPercentage() { return percentage; }
    public void setPercentage(Double percentage) { this.percentage = percentage; }
}
