package com.school.staffadmindirectory.dto;

public class StaffDirectorySummaryDto {
    private String staffName;
    private String staffCode;
    private String department;
    private String role;
    private long totalDirectives;
    private long personalDirectives;
    private long broadcastDirectives;
    private long pendingAction;
    private long urgentCount;
    private long completedCount;

    public StaffDirectorySummaryDto() {}

    public String getStaffName() {
        return staffName;
    }

    public void setStaffName(String staffName) {
        this.staffName = staffName;
    }

    public String getStaffCode() {
        return staffCode;
    }

    public void setStaffCode(String staffCode) {
        this.staffCode = staffCode;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public long getTotalDirectives() {
        return totalDirectives;
    }

    public void setTotalDirectives(long totalDirectives) {
        this.totalDirectives = totalDirectives;
    }

    public long getPersonalDirectives() {
        return personalDirectives;
    }

    public void setPersonalDirectives(long personalDirectives) {
        this.personalDirectives = personalDirectives;
    }

    public long getBroadcastDirectives() {
        return broadcastDirectives;
    }

    public void setBroadcastDirectives(long broadcastDirectives) {
        this.broadcastDirectives = broadcastDirectives;
    }

    public long getPendingAction() {
        return pendingAction;
    }

    public void setPendingAction(long pendingAction) {
        this.pendingAction = pendingAction;
    }

    public long getUrgentCount() {
        return urgentCount;
    }

    public void setUrgentCount(long urgentCount) {
        this.urgentCount = urgentCount;
    }

    public long getCompletedCount() {
        return completedCount;
    }

    public void setCompletedCount(long completedCount) {
        this.completedCount = completedCount;
    }
}

