package com.school.adminstaffdirectory.dto;

public class StaffMemberDto {
    private Long id;
    private String staffCode;
    private String fullName;
    private String username;
    private String email;
    private String phone;
    private String role;
    private String designation;
    private String department;
    private String status;
    private String joinedDate;
    private int activeDirectivesCount;

    public StaffMemberDto() {}

    public StaffMemberDto(Long id, String staffCode, String fullName, String username, String email,
                          String phone, String role, String designation, String department,
                          String status, String joinedDate, int activeDirectivesCount) {
        this.id = id;
        this.staffCode = staffCode;
        this.fullName = fullName;
        this.username = username;
        this.email = email;
        this.phone = phone;
        this.role = role;
        this.designation = designation;
        this.department = department;
        this.status = status;
        this.joinedDate = joinedDate;
        this.activeDirectivesCount = activeDirectivesCount;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getStaffCode() {
        return staffCode;
    }

    public void setStaffCode(String staffCode) {
        this.staffCode = staffCode;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getDesignation() {
        return designation;
    }

    public void setDesignation(String designation) {
        this.designation = designation;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getJoinedDate() {
        return joinedDate;
    }

    public void setJoinedDate(String joinedDate) {
        this.joinedDate = joinedDate;
    }

    public int getActiveDirectivesCount() {
        return activeDirectivesCount;
    }

    public void setActiveDirectivesCount(int activeDirectivesCount) {
        this.activeDirectivesCount = activeDirectivesCount;
    }
}

