package com.school.parentprofile.dto;

import com.school.parentprofile.entity.ParentChildRelationship;
import com.school.parentprofile.entity.ParentProfile;

import java.util.List;

public class ParentProfileResponse {
    private ParentProfile profile;
    private List<ParentChildRelationship> children;
    private int totalChildren;
    private int acceptedCount;
    private int pendingCount;
    private int rejectedCount;
    private String message;

    public ParentProfileResponse() {}

    public ParentProfileResponse(ParentProfile profile, List<ParentChildRelationship> children, String message) {
        this.profile = profile;
        this.children = children;
        this.totalChildren = children != null ? children.size() : 0;
        this.acceptedCount = children != null ? (int) children.stream().filter(c -> "ACCEPTED".equalsIgnoreCase(c.getStatus()) || "APPROVED".equalsIgnoreCase(c.getStatus())).count() : 0;
        this.pendingCount = children != null ? (int) children.stream().filter(c -> "PENDING".equalsIgnoreCase(c.getStatus())).count() : 0;
        this.rejectedCount = children != null ? (int) children.stream().filter(c -> "REJECTED".equalsIgnoreCase(c.getStatus())).count() : 0;
        this.message = message;
    }

    public ParentProfile getProfile() { return profile; }
    public void setProfile(ParentProfile profile) { this.profile = profile; }

    public List<ParentChildRelationship> getChildren() { return children; }
    public void setChildren(List<ParentChildRelationship> children) { this.children = children; }

    public int getTotalChildren() { return totalChildren; }
    public void setTotalChildren(int totalChildren) { this.totalChildren = totalChildren; }

    public int getAcceptedCount() { return acceptedCount; }
    public void setAcceptedCount(int acceptedCount) { this.acceptedCount = acceptedCount; }

    public int getPendingCount() { return pendingCount; }
    public void setPendingCount(int pendingCount) { this.pendingCount = pendingCount; }

    public int getRejectedCount() { return rejectedCount; }
    public void setRejectedCount(int rejectedCount) { this.rejectedCount = rejectedCount; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
