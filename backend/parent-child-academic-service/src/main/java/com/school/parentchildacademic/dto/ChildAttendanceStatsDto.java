package com.school.parentchildacademic.dto;

public class ChildAttendanceStatsDto {
    private Double percentage;
    private Integer presentDays;
    private Integer totalDays;
    private Integer absentDays;
    private String status;

    public ChildAttendanceStatsDto() {}

    public ChildAttendanceStatsDto(Double percentage, Integer presentDays, Integer totalDays, Integer absentDays, String status) {
        this.percentage = percentage;
        this.presentDays = presentDays;
        this.totalDays = totalDays;
        this.absentDays = absentDays;
        this.status = status;
    }

    public Double getPercentage() { return percentage; }
    public void setPercentage(Double percentage) { this.percentage = percentage; }

    public Integer getPresentDays() { return presentDays; }
    public void setPresentDays(Integer presentDays) { this.presentDays = presentDays; }

    public Integer getTotalDays() { return totalDays; }
    public void setTotalDays(Integer totalDays) { this.totalDays = totalDays; }

    public Integer getAbsentDays() { return absentDays; }
    public void setAbsentDays(Integer absentDays) { this.absentDays = absentDays; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
