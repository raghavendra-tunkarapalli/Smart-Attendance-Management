package com.school.studentfee.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class FeeReceiptDto {

    private String receiptNumber;
    private String transactionReference;
    private String studentId;
    private String studentName;
    private String parentName;
    private String parentPhone;
    private String classStandard;
    private String sectionName;
    private String academicYear;
    private int installmentNumber;
    private String installmentTitle;
    private BigDecimal amount;
    private String amountInWords;
    private LocalDateTime paymentDate;
    private String paymentStatus;
    private String paymentMethod;
    private String institutionName;
    private String institutionAddress;
    private String affiliationNo;
    private String authorizedSignatory;
    private LocalDateTime generatedAt;

    public FeeReceiptDto() {
        this.institutionName = "Springfield Public School & International Academy";
        this.institutionAddress = "Main Campus, Knowledge Corridor, Sector 4";
        this.affiliationNo = "CBSE / STATE REG #982103";
        this.authorizedSignatory = "Accounts & Finance Controller";
        this.paymentStatus = "VERIFIED & CLEARED";
        this.paymentMethod = "Institutional Cashier / Verified Portal Gateway";
        this.generatedAt = LocalDateTime.now();
    }

    public String getReceiptNumber() {
        return receiptNumber;
    }

    public void setReceiptNumber(String receiptNumber) {
        this.receiptNumber = receiptNumber;
    }

    public String getTransactionReference() {
        return transactionReference;
    }

    public void setTransactionReference(String transactionReference) {
        this.transactionReference = transactionReference;
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

    public String getSectionName() {
        return sectionName;
    }

    public void setSectionName(String sectionName) {
        this.sectionName = sectionName;
    }

    public String getAcademicYear() {
        return academicYear;
    }

    public void setAcademicYear(String academicYear) {
        this.academicYear = academicYear;
    }

    public int getInstallmentNumber() {
        return installmentNumber;
    }

    public void setInstallmentNumber(int installmentNumber) {
        this.installmentNumber = installmentNumber;
    }

    public String getInstallmentTitle() {
        return installmentTitle;
    }

    public void setInstallmentTitle(String installmentTitle) {
        this.installmentTitle = installmentTitle;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getAmountInWords() {
        return amountInWords;
    }

    public void setAmountInWords(String amountInWords) {
        this.amountInWords = amountInWords;
    }

    public LocalDateTime getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(LocalDateTime paymentDate) {
        this.paymentDate = paymentDate;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getInstitutionName() {
        return institutionName;
    }

    public void setInstitutionName(String institutionName) {
        this.institutionName = institutionName;
    }

    public String getInstitutionAddress() {
        return institutionAddress;
    }

    public void setInstitutionAddress(String institutionAddress) {
        this.institutionAddress = institutionAddress;
    }

    public String getAffiliationNo() {
        return affiliationNo;
    }

    public void setAffiliationNo(String affiliationNo) {
        this.affiliationNo = affiliationNo;
    }

    public String getAuthorizedSignatory() {
        return authorizedSignatory;
    }

    public void setAuthorizedSignatory(String authorizedSignatory) {
        this.authorizedSignatory = authorizedSignatory;
    }

    public LocalDateTime getGeneratedAt() {
        return generatedAt;
    }

    public void setGeneratedAt(LocalDateTime generatedAt) {
        this.generatedAt = generatedAt;
    }
}

