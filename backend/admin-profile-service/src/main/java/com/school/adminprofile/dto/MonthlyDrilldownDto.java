package com.school.adminprofile.dto;

import java.util.List;

public class MonthlyDrilldownDto {
    private int year;
    private Integer month;
    private String monthName;
    private AnalyticsSummaryDto summary;
    private List<MonthlyStatDto> monthlyTrends;
    private List<AdmissionItemDto> admissions;
    private List<PaymentTransactionDto> transactions;
    private List<StudentFeeSummaryDto> studentFeeSummaries;

    public MonthlyDrilldownDto() {
    }

    public MonthlyDrilldownDto(int year, Integer month, String monthName, AnalyticsSummaryDto summary,
                               List<MonthlyStatDto> monthlyTrends,
                               List<AdmissionItemDto> admissions,
                               List<PaymentTransactionDto> transactions,
                               List<StudentFeeSummaryDto> studentFeeSummaries) {
        this.year = year;
        this.month = month;
        this.monthName = monthName;
        this.summary = summary;
        this.monthlyTrends = monthlyTrends;
        this.admissions = admissions;
        this.transactions = transactions;
        this.studentFeeSummaries = studentFeeSummaries;
    }

    public int getYear() {
        return year;
    }

    public void setYear(int year) {
        this.year = year;
    }

    public Integer getMonth() {
        return month;
    }

    public void setMonth(Integer month) {
        this.month = month;
    }

    public String getMonthName() {
        return monthName;
    }

    public void setMonthName(String monthName) {
        this.monthName = monthName;
    }

    public AnalyticsSummaryDto getSummary() {
        return summary;
    }

    public void setSummary(AnalyticsSummaryDto summary) {
        this.summary = summary;
    }

    public List<MonthlyStatDto> getMonthlyTrends() {
        return monthlyTrends;
    }

    public void setMonthlyTrends(List<MonthlyStatDto> monthlyTrends) {
        this.monthlyTrends = monthlyTrends;
    }

    public List<AdmissionItemDto> getAdmissions() {
        return admissions;
    }

    public void setAdmissions(List<AdmissionItemDto> admissions) {
        this.admissions = admissions;
    }

    public List<PaymentTransactionDto> getTransactions() {
        return transactions;
    }

    public void setTransactions(List<PaymentTransactionDto> transactions) {
        this.transactions = transactions;
    }

    public List<StudentFeeSummaryDto> getStudentFeeSummaries() {
        return studentFeeSummaries;
    }

    public void setStudentFeeSummaries(List<StudentFeeSummaryDto> studentFeeSummaries) {
        this.studentFeeSummaries = studentFeeSummaries;
    }
}
