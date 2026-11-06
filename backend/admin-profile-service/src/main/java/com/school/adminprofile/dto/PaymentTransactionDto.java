package com.school.adminprofile.dto;

import java.math.BigDecimal;

public class PaymentTransactionDto {
    private String transactionId;
    private String studentId;
    private String studentName;
    private String parentName;
    private String parentPhone;
    private String classStandard;
    private String installmentName;
    private BigDecimal amount;
    private String paidAt;
    private String feeStatus;

    // Student Total Fee Details
    private BigDecimal studentTotalFee;
    private BigDecimal studentTotalPaid;
    private BigDecimal studentDueAmount;
    private String studentOverallStatus;

    public PaymentTransactionDto() {
        this.studentTotalFee = BigDecimal.ZERO;
        this.studentTotalPaid = BigDecimal.ZERO;
        this.studentDueAmount = BigDecimal.ZERO;
    }

    public PaymentTransactionDto(String transactionId, String studentId, String studentName, String parentName,
                                 String parentPhone, String classStandard, String installmentName,
                                 BigDecimal amount, String paidAt, String feeStatus) {
        this.transactionId = transactionId;
        this.studentId = studentId;
        this.studentName = studentName;
        this.parentName = parentName;
        this.parentPhone = parentPhone;
        this.classStandard = classStandard;
        this.installmentName = installmentName;
        this.amount = amount;
        this.paidAt = paidAt;
        this.feeStatus = feeStatus;
        this.studentTotalFee = BigDecimal.ZERO;
        this.studentTotalPaid = BigDecimal.ZERO;
        this.studentDueAmount = BigDecimal.ZERO;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
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

    public String getClassStandard() {
        return classStandard;
    }

    public void setClassStandard(String classStandard) {
        this.classStandard = classStandard;
    }

    public String getInstallmentName() {
        return installmentName;
    }

    public void setInstallmentName(String installmentName) {
        this.installmentName = installmentName;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getPaidAt() {
        return paidAt;
    }

    public void setPaidAt(String paidAt) {
        this.paidAt = paidAt;
    }

    public String getFeeStatus() {
        return feeStatus;
    }

    public void setFeeStatus(String feeStatus) {
        this.feeStatus = feeStatus;
    }

    public BigDecimal getStudentTotalFee() {
        return studentTotalFee;
    }

    public void setStudentTotalFee(BigDecimal studentTotalFee) {
        this.studentTotalFee = studentTotalFee;
    }

    public BigDecimal getStudentTotalPaid() {
        return studentTotalPaid;
    }

    public void setStudentTotalPaid(BigDecimal studentTotalPaid) {
        this.studentTotalPaid = studentTotalPaid;
    }

    public BigDecimal getStudentDueAmount() {
        return studentDueAmount;
    }

    public void setStudentDueAmount(BigDecimal studentDueAmount) {
        this.studentDueAmount = studentDueAmount;
    }

    public String getStudentOverallStatus() {
        return studentOverallStatus;
    }

    public void setStudentOverallStatus(String studentOverallStatus) {
        this.studentOverallStatus = studentOverallStatus;
    }
}
