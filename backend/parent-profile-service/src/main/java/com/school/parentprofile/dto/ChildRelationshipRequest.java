package com.school.parentprofile.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ChildRelationshipRequest {

    @NotNull(message = "Parent user ID is required")
    private Long parentUserId;

    // Optional direct reference to student user ID in users table
    private Long studentUserId;

    // Optional reference to student_details table
    private Long studentDetailsId;

    private String parentEmail;
    private String parentName;

    private String studentIdentity;
    private String childName;

    @NotBlank(message = "Class name is required")
    private String className;

    @NotBlank(message = "Section is required")
    private String section;

    @NotBlank(message = "Relationship type is required")
    private String relationshipType;

    private String emergencyContact;
    private String notes;

    public ChildRelationshipRequest() {}

    public Long getParentUserId() { return parentUserId; }
    public void setParentUserId(Long parentUserId) { this.parentUserId = parentUserId; }

    public Long getStudentUserId() { return studentUserId; }
    public void setStudentUserId(Long studentUserId) { this.studentUserId = studentUserId; }

    public Long getStudentDetailsId() { return studentDetailsId; }
    public void setStudentDetailsId(Long studentDetailsId) { this.studentDetailsId = studentDetailsId; }

    public String getParentEmail() { return parentEmail; }
    public void setParentEmail(String parentEmail) { this.parentEmail = parentEmail; }

    public String getParentName() { return parentName; }
    public void setParentName(String parentName) { this.parentName = parentName; }

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

    public String getEmergencyContact() { return emergencyContact; }
    public void setEmergencyContact(String emergencyContact) { this.emergencyContact = emergencyContact; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
