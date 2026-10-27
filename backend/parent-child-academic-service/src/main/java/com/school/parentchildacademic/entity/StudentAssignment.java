package com.school.parentchildacademic.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "student_assignment")
public class StudentAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

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

    @Column(name = "results_released")
    private Boolean resultsReleased = true;

    @OneToMany(mappedBy = "assignment", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<AssignmentQuestion> questions = new ArrayList<>();

    public StudentAssignment() {}

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

    public Boolean getResultsReleased() { return resultsReleased; }
    public void setResultsReleased(Boolean resultsReleased) { this.resultsReleased = resultsReleased; }

    public List<AssignmentQuestion> getQuestions() { return questions; }
    public void setQuestions(List<AssignmentQuestion> questions) { this.questions = questions; }
}
