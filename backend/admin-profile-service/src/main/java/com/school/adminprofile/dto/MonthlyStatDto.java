package com.school.adminprofile.dto;

import java.math.BigDecimal;

public class MonthlyStatDto {
    private int month;
    private String monthName;
    private int year;
    private long admissionsCount;
    private long confirmedAdmissions;
    private long pendingAdmissions;
    private BigDecimal parentPaymentsAmount;
    private long transactionCount;

    public MonthlyStatDto() {
        this.parentPaymentsAmount = BigDecimal.ZERO;
    }

    public MonthlyStatDto(int month, String monthName, int year) {
        this.month = month;
        this.monthName = monthName;
        this.year = year;
        this.admissionsCount = 0;
        this.confirmedAdmissions = 0;
        this.pendingAdmissions = 0;
        this.parentPaymentsAmount = BigDecimal.ZERO;
        this.transactionCount = 0;
    }

    public int getMonth() {
        return month;
    }

    public void setMonth(int month) {
        this.month = month;
    }

    public String getMonthName() {
        return monthName;
    }

    public void setMonthName(String monthName) {
        this.monthName = monthName;
    }

    public int getYear() {
        return year;
    }

    public void setYear(int year) {
        this.year = year;
    }

    public long getAdmissionsCount() {
        return admissionsCount;
    }

    public void setAdmissionsCount(long admissionsCount) {
        this.admissionsCount = admissionsCount;
    }

    public long getConfirmedAdmissions() {
        return confirmedAdmissions;
    }

    public void setConfirmedAdmissions(long confirmedAdmissions) {
        this.confirmedAdmissions = confirmedAdmissions;
    }

    public long getPendingAdmissions() {
        return pendingAdmissions;
    }

    public void setPendingAdmissions(long pendingAdmissions) {
        this.pendingAdmissions = pendingAdmissions;
    }

    public BigDecimal getParentPaymentsAmount() {
        return parentPaymentsAmount;
    }

    public void setParentPaymentsAmount(BigDecimal parentPaymentsAmount) {
        this.parentPaymentsAmount = parentPaymentsAmount;
    }

    public long getTransactionCount() {
        return transactionCount;
    }

    public void setTransactionCount(long transactionCount) {
        this.transactionCount = transactionCount;
    }
}

