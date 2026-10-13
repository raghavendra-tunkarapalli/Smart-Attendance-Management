package com.school.studentexamination.dto;

import java.util.ArrayList;
import java.util.List;

public class ExamPaperResponse {
    private Long assignmentId;
    private String assignmentTitle;
    private String subject;
    private Integer classStandard;
    private String sectionName;
    private String conductDate;
    private Integer totalQuestions;
    private boolean alreadyAttempted;
    private List<ExamQuestionDto> questions = new ArrayList<>();

    public ExamPaperResponse() {}

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

    public boolean isAlreadyAttempted() { return alreadyAttempted; }
    public void setAlreadyAttempted(boolean alreadyAttempted) { this.alreadyAttempted = alreadyAttempted; }

    public List<ExamQuestionDto> getQuestions() { return questions; }
    public void setQuestions(List<ExamQuestionDto> questions) { this.questions = questions; }
}
