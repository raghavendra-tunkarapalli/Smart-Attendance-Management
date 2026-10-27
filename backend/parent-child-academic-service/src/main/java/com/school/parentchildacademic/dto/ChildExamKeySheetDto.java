package com.school.parentchildacademic.dto;

import java.util.List;

public class ChildExamKeySheetDto {
    private Long assignmentId;
    private String assignmentTitle;
    private String subject;
    private Double score;
    private Double totalMarks;
    private Double percentage;
    private String status;
    private String remarks;
    private List<ExamQuestionDto> questions;

    public ChildExamKeySheetDto() {}

    public Long getAssignmentId() { return assignmentId; }
    public void setAssignmentId(Long assignmentId) { this.assignmentId = assignmentId; }

    public String getAssignmentTitle() { return assignmentTitle; }
    public void setAssignmentTitle(String assignmentTitle) { this.assignmentTitle = assignmentTitle; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

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

    public List<ExamQuestionDto> getQuestions() { return questions; }
    public void setQuestions(List<ExamQuestionDto> questions) { this.questions = questions; }
}
