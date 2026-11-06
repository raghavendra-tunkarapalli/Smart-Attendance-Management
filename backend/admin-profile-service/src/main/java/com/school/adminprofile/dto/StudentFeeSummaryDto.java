package com.school.adminprofile.dto;

import java.math.BigDecimal;

public class StudentFeeSummaryDto {
    private String studentId;
    private String studentName;
    private String classStandard;
    private String sectionName;
    private String parentName;
    private String parentPhone;
    private BigDecimal totalAmount;
    private BigDecimal totalAmountPaid;
    private BigDecimal dueAmount;
    private String feeStatus;
    private int paidPercentage;
    private int termsPaidCount;
    private String firstInstallmentStatus;
    private String firstInstallmentPaidAt;
    private String secondInstallmentStatus;
    private String secondInstallmentPaidAt;
    private String thirdInstallmentStatus;
    private String thirdInstallmentPaidAt;
    private String fourthInstallmentStatus;
    private String fourthInstallmentPaidAt;

    public StudentFeeSummaryDto() {
        this.totalAmount = BigDecimal.ZERO;
        this.totalAmountPaid = BigDecimal.ZERO;
        this.dueAmount = BigDecimal.ZERO;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getClassStandard() {
        return classStandard;
    }

    public void setClassStandard(String classStandard) {
        this.classStandard = classStandard;
    }

    public String getSectionName() {
        return sectionName;
    }

    public void setSectionName(String sectionName) {
        this.sectionName = sectionName;
    }

    public String getParentName() {
        return parentName;
    }

    public void setParentName(String parentName) {
        this.parentName = parentName;
    }

    public String getParentPhone() {
        return parentPhone;
    }

    public void setParentPhone(String parentPhone) {
        this.parentPhone = parentPhone;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public BigDecimal getTotalAmountPaid() {
        return totalAmountPaid;
    }

    public void setTotalAmountPaid(BigDecimal totalAmountPaid) {
        this.totalAmountPaid = totalAmountPaid;
    }

    public BigDecimal getDueAmount() {
        return dueAmount;
    }

    public void setDueAmount(BigDecimal dueAmount) {
        this.dueAmount = dueAmount;
    }

    public String getFeeStatus() {
        return feeStatus;
    }

    public void setFeeStatus(String feeStatus) {
        this.feeStatus = feeStatus;
    }

    public int getPaidPercentage() {
        return paidPercentage;
    }

    public void setPaidPercentage(int paidPercentage) {
        this.paidPercentage = paidPercentage;
    }

    public int getTermsPaidCount() {
        return termsPaidCount;
    }

    public void setTermsPaidCount(int termsPaidCount) {
        this.termsPaidCount = termsPaidCount;
    }

    public String getFirstInstallmentStatus() {
        return firstInstallmentStatus;
    }

    public void setFirstInstallmentStatus(String firstInstallmentStatus) {
        this.firstInstallmentStatus = firstInstallmentStatus;
    }

    public String getFirstInstallmentPaidAt() {
        return firstInstallmentPaidAt;
    }

    public void setFirstInstallmentPaidAt(String firstInstallmentPaidAt) {
        this.firstInstallmentPaidAt = firstInstallmentPaidAt;
    }

    public String getSecondInstallmentStatus() {
        return secondInstallmentStatus;
    }

    public void setSecondInstallmentStatus(String secondInstallmentStatus) {
        this.secondInstallmentStatus = secondInstallmentStatus;
    }

    public String getSecondInstallmentPaidAt() {
        return secondInstallmentPaidAt;
    }

    public void setSecondInstallmentPaidAt(String secondInstallmentPaidAt) {
        this.secondInstallmentPaidAt = secondInstallmentPaidAt;
    }

    public String getThirdInstallmentStatus() {
        return thirdInstallmentStatus;
    }

    public void setThirdInstallmentStatus(String thirdInstallmentStatus) {
        this.thirdInstallmentStatus = thirdInstallmentStatus;
    }

    public String getThirdInstallmentPaidAt() {
        return thirdInstallmentPaidAt;
    }

    public void setThirdInstallmentPaidAt(String thirdInstallmentPaidAt) {
        this.thirdInstallmentPaidAt = thirdInstallmentPaidAt;
    }

    public String getFourthInstallmentStatus() {
        return fourthInstallmentStatus;
    }

    public void setFourthInstallmentStatus(String fourthInstallmentStatus) {
        this.fourthInstallmentStatus = fourthInstallmentStatus;
    }

    public String getFourthInstallmentPaidAt() {
        return fourthInstallmentPaidAt;
    }

    public void setFourthInstallmentPaidAt(String fourthInstallmentPaidAt) {
        this.fourthInstallmentPaidAt = fourthInstallmentPaidAt;
    }
}

