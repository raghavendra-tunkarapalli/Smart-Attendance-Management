package com.school.studentexamination.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_exam_submissions", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"student_username", "assignment_id"})
})
public class StudentExamSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_username", nullable = false)
    private String studentUsername;

    @Column(name = "student_name")
    private String studentName;

    @Column(name = "assignment_id", nullable = false)
    private Long assignmentId;

    @Column(name = "assignment_title", nullable = false)
    private String assignmentTitle;

    @Column(name = "subject")
    private String subject;

    @Column(name = "class_standard", nullable = false)
    private Integer classStandard;

    @Column(name = "section_name", nullable = false)
    private String sectionName;

    @Column(name = "conduct_date")
    private String conductDate;

    @Column(name = "total_questions", nullable = false)
    private Integer totalQuestions = 0;

    @Column(name = "attempted_questions", nullable = false)
    private Integer attemptedQuestions = 0;

    @Column(name = "correct_answers", nullable = false)
    private Integer correctAnswers = 0;

    @Column(name = "score", nullable = false)
    private Double score = 0.0;

    @Column(name = "total_marks", nullable = false)
    private Double totalMarks = 0.0;

    @Column(name = "percentage", nullable = false)
    private Double percentage = 0.0;

    @Column(name = "status", nullable = false, length = 50)
    private String status = "ATTEMPTED"; // "ATTEMPTED", "UNATTEMPTED"

    @Column(name = "remarks", length = 255)
    private String remarks;

    @Column(name = "student_answers", columnDefinition = "TEXT")
    private String studentAnswers;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public StudentExamSubmission() {
    }

    @PrePersist
    public void onPrePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.submittedAt == null && !"UNATTEMPTED".equalsIgnoreCase(this.status)) {
            this.submittedAt = LocalDateTime.now();
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getStudentUsername() { return studentUsername; }
    public void setStudentUsername(String studentUsername) { this.studentUsername = studentUsername; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

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

    public String getStudentAnswers() { return studentAnswers; }
    public void setStudentAnswers(String studentAnswers) { this.studentAnswers = studentAnswers; }

    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
