package com.school.parentchildacademic.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_exam_submissions")
public class StudentExamSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "assignment_id", nullable = false)
    private Long assignmentId;

    @Column(name = "assignment_title", nullable = false)
    private String assignmentTitle;

    @Column(name = "student_username", nullable = false)
    private String studentUsername;

    @Column(name = "student_name")
    private String studentName;

    @Column(name = "subject")
    private String subject;

    @Column(name = "class_standard")
    private Integer classStandard;

    @Column(name = "section_name")
    private String sectionName;

    @Column(name = "conduct_date")
    private String conductDate;

    @Column(name = "total_questions")
    private Integer totalQuestions;

    @Column(name = "attempted_questions")
    private Integer attemptedQuestions;

    @Column(name = "correct_answers")
    private Integer correctAnswers;

    @Column(name = "score")
    private Double score;

    @Column(name = "total_marks")
    private Double totalMarks;

    @Column(name = "percentage")
    private Double percentage;

    @Column(name = "status")
    private String status;

    @Column(name = "remarks")
    private String remarks;

    @Column(name = "student_answers", columnDefinition = "TEXT")
    private String studentAnswers;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    public StudentExamSubmission() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getAssignmentId() { return assignmentId; }
    public void setAssignmentId(Long assignmentId) { this.assignmentId = assignmentId; }

    public String getAssignmentTitle() { return assignmentTitle; }
    public void setAssignmentTitle(String assignmentTitle) { this.assignmentTitle = assignmentTitle; }

    public String getStudentUsername() { return studentUsername; }
    public void setStudentUsername(String studentUsername) { this.studentUsername = studentUsername; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

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

    public String getStudentAnswers() { return studentAnswers; }
    public void setStudentAnswers(String studentAnswers) { this.studentAnswers = studentAnswers; }

    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
}
