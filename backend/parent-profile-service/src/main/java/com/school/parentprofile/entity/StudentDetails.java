package com.school.parentprofile.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "student_details")
public class StudentDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Unique Student ID (e.g. ADM-24992, ADM-78578, STU-1042)
    @Column(name = "student_id", unique = true, nullable = false)
    private String studentId;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(name = "parent_name", nullable = false)
    private String parentName;

    @Column(name = "class_standard", nullable = false)
    private Integer classStandard;

    @Column(name = "section_name", nullable = false)
    private String sectionName;

    public StudentDetails() {}

    public StudentDetails(String studentId, String firstName, String lastName, String parentName, Integer classStandard, String sectionName) {
        this.studentId = studentId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.parentName = parentName;
        this.classStandard = classStandard;
        this.sectionName = sectionName;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getFullName() {
        String first = firstName != null ? firstName.trim() : "";
        String last = lastName != null ? lastName.trim() : "";
        return (first + " " + last).trim();
    }

    public String getParentName() { return parentName; }
    public void setParentName(String parentName) { this.parentName = parentName; }

    public Integer getClassStandard() { return classStandard; }
    public void setClassStandard(Integer classStandard) { this.classStandard = classStandard; }

    public String getSectionName() { return sectionName; }
    public void setSectionName(String sectionName) { this.sectionName = sectionName; }

    public String getFormattedClass() {
        return "Grade " + (classStandard != null ? classStandard : 1);
    }
}
