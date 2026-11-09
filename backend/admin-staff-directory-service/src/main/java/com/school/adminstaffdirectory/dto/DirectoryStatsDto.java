package com.school.adminstaffdirectory.dto;

public class DirectoryStatsDto {
    private long totalStaff;
    private long facultyCount;
    private long administrativeCount;
    private long totalDirections;
    private long activeDirections;
    private long urgentDirections;
    private long completedDirections;

    public DirectoryStatsDto() {}

    public DirectoryStatsDto(long totalStaff, long facultyCount, long administrativeCount,
                             long totalDirections, long activeDirections, long urgentDirections,
                             long completedDirections) {
        this.totalStaff = totalStaff;
        this.facultyCount = facultyCount;
        this.administrativeCount = administrativeCount;
        this.totalDirections = totalDirections;
        this.activeDirections = activeDirections;
        this.urgentDirections = urgentDirections;
        this.completedDirections = completedDirections;
    }

    public long getTotalStaff() {
        return totalStaff;
    }

    public void setTotalStaff(long totalStaff) {
        this.totalStaff = totalStaff;
    }

    public long getFacultyCount() {
        return facultyCount;
    }

    public void setFacultyCount(long facultyCount) {
        this.facultyCount = facultyCount;
    }

    public long getAdministrativeCount() {
        return administrativeCount;
    }

    public void setAdministrativeCount(long administrativeCount) {
        this.administrativeCount = administrativeCount;
    }

    public long getTotalDirections() {
        return totalDirections;
    }

    public void setTotalDirections(long totalDirections) {
        this.totalDirections = totalDirections;
    }

    public long getActiveDirections() {
        return activeDirections;
    }

    public void setActiveDirections(long activeDirections) {
        this.activeDirections = activeDirections;
    }

    public long getUrgentDirections() {
        return urgentDirections;
    }

    public void setUrgentDirections(long urgentDirections) {
        this.urgentDirections = urgentDirections;
    }

    public long getCompletedDirections() {
        return completedDirections;
    }

    public void setCompletedDirections(long completedDirections) {
        this.completedDirections = completedDirections;
    }
}

