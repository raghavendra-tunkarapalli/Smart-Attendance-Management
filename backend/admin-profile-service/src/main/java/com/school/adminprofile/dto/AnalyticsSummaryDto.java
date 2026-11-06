package com.school.adminprofile.dto;

import java.math.BigDecimal;

public class AnalyticsSummaryDto {
    private int selectedYear;
    private Integer selectedMonth;
    private String selectedMonthName;
    private long totalAdmissions;
    private long confirmedAdmissions;
    private long pendingAdmissions;
    private BigDecimal totalParentPayments;
    private BigDecimal avgMonthlyPayments;
    private long totalTransactions;
    private String peakAdmissionMonth;
    private String peakPaymentMonth;
    private long activeStudents;

    public AnalyticsSummaryDto() {
        this.totalParentPayments = BigDecimal.ZERO;
        this.avgMonthlyPayments = BigDecimal.ZERO;
    }

    public int getSelectedYear() {
        return selectedYear;
    }

    public void setSelectedYear(int selectedYear) {
        this.selectedYear = selectedYear;
    }

    public Integer getSelectedMonth() {
        return selectedMonth;
    }

    public void setSelectedMonth(Integer selectedMonth) {
        this.selectedMonth = selectedMonth;
    }

    public String getSelectedMonthName() {
        return selectedMonthName;
    }

    public void setSelectedMonthName(String selectedMonthName) {
        this.selectedMonthName = selectedMonthName;
    }

    public long getTotalAdmissions() {
        return totalAdmissions;
    }

    public void setTotalAdmissions(long totalAdmissions) {
        this.totalAdmissions = totalAdmissions;
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

    public BigDecimal getTotalParentPayments() {
        return totalParentPayments;
    }

    public void setTotalParentPayments(BigDecimal totalParentPayments) {
        this.totalParentPayments = totalParentPayments;
    }

    public BigDecimal getAvgMonthlyPayments() {
        return avgMonthlyPayments;
    }

    public void setAvgMonthlyPayments(BigDecimal avgMonthlyPayments) {
        this.avgMonthlyPayments = avgMonthlyPayments;
    }

    public long getTotalTransactions() {
        return totalTransactions;
    }

    public void setTotalTransactions(long totalTransactions) {
        this.totalTransactions = totalTransactions;
    }

    public String getPeakAdmissionMonth() {
        return peakAdmissionMonth;
    }

    public void setPeakAdmissionMonth(String peakAdmissionMonth) {
        this.peakAdmissionMonth = peakAdmissionMonth;
    }

    public String getPeakPaymentMonth() {
        return peakPaymentMonth;
    }

    public void setPeakPaymentMonth(String peakPaymentMonth) {
        this.peakPaymentMonth = peakPaymentMonth;
    }

    public long getActiveStudents() {
        return activeStudents;
    }

    public void setActiveStudents(long activeStudents) {
        this.activeStudents = activeStudents;
    }
}

