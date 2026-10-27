package com.school.parentchildacademic.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "parent_child_relationships")
public class ParentChildRelationship {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "parent_user_id")
    private Long parentUserId;

    @Column(name = "student_user_id")
    private Long studentUserId;

    @Column(name = "student_unique_id")
    private String studentUniqueId;

    @Column(name = "student_identity")
    private String studentIdentity;

    @Column(name = "child_name")
    private String childName;

    @Column(name = "class_name")
    private String className;

    @Column(name = "section")
    private String section;

    @Column(name = "relationship_type")
    private String relationshipType;

    @Column(name = "status")
    private String status;

    @Column(name = "student_username")
    private String studentUsername;

    @Column(name = "student_email")
    private String studentEmail;

    public ParentChildRelationship() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getParentUserId() { return parentUserId; }
    public void setParentUserId(Long parentUserId) { this.parentUserId = parentUserId; }

    public Long getStudentUserId() { return studentUserId; }
    public void setStudentUserId(Long studentUserId) { this.studentUserId = studentUserId; }

    public String getStudentUniqueId() { return studentUniqueId; }
    public void setStudentUniqueId(String studentUniqueId) { this.studentUniqueId = studentUniqueId; }

    public String getStudentIdentity() { return studentIdentity; }
    public void setStudentIdentity(String studentIdentity) { this.studentIdentity = studentIdentity; }

    public String getChildName() { return childName; }
    public void setChildName(String childName) { this.childName = childName; }

    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }

    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }

    public String getRelationshipType() { return relationshipType; }
    public void setRelationshipType(String relationshipType) { this.relationshipType = relationshipType; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getStudentUsername() { return studentUsername; }
    public void setStudentUsername(String studentUsername) { this.studentUsername = studentUsername; }

    public String getStudentEmail() { return studentEmail; }
    public void setStudentEmail(String studentEmail) { this.studentEmail = studentEmail; }
}
