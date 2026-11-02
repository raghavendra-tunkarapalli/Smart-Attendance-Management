package com.school.parenttuitionfee.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ChildFeeDetailDto {

    private String studentId;
    private String childName;
    private String className;
    private String section;
    private String academicYear;
    private String parentName;
    private String parentPhone;

    private BigDecimal totalAmount;
    private BigDecimal totalAmountPaid;
    private BigDecimal dueAmount;
    private String feeStatus; // PAID, PARTIAL, UNPAID

    // Installments
    private BigDecimal firstInstallment;
    private String firstInstallmentStatus;
    private LocalDateTime firstInstallmentPaidAt;

    private BigDecimal secondInstallment;
    private String secondInstallmentStatus;
    private LocalDateTime secondInstallmentPaidAt;

    private BigDecimal thirdInstallment;
    private String thirdInstallmentStatus;
    private LocalDateTime thirdInstallmentPaidAt;

    private BigDecimal fourthInstallment;
    private String fourthInstallmentStatus;
    private LocalDateTime fourthInstallmentPaidAt;

    public ChildFeeDetailDto() {}

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getChildName() { return childName; }
    public void setChildName(String childName) { this.childName = childName; }

    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }

    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }

    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }

    public String getParentName() { return parentName; }
    public void setParentName(String parentName) { this.parentName = parentName; }

    public String getParentPhone() { return parentPhone; }
    public void setParentPhone(String parentPhone) { this.parentPhone = parentPhone; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public BigDecimal getTotalAmountPaid() { return totalAmountPaid; }
    public void setTotalAmountPaid(BigDecimal totalAmountPaid) { this.totalAmountPaid = totalAmountPaid; }

    public BigDecimal getDueAmount() { return dueAmount; }
    public void setDueAmount(BigDecimal dueAmount) { this.dueAmount = dueAmount; }

    public String getFeeStatus() { return feeStatus; }
    public void setFeeStatus(String feeStatus) { this.feeStatus = feeStatus; }

    public BigDecimal getFirstInstallment() { return firstInstallment; }
    public void setFirstInstallment(BigDecimal firstInstallment) { this.firstInstallment = firstInstallment; }

    public String getFirstInstallmentStatus() { return firstInstallmentStatus; }
    public void setFirstInstallmentStatus(String firstInstallmentStatus) { this.firstInstallmentStatus = firstInstallmentStatus; }

    public LocalDateTime getFirstInstallmentPaidAt() { return firstInstallmentPaidAt; }
    public void setFirstInstallmentPaidAt(LocalDateTime firstInstallmentPaidAt) { this.firstInstallmentPaidAt = firstInstallmentPaidAt; }

    public BigDecimal getSecondInstallment() { return secondInstallment; }
    public void setSecondInstallment(BigDecimal secondInstallment) { this.secondInstallment = secondInstallment; }

    public String getSecondInstallmentStatus() { return secondInstallmentStatus; }
    public void setSecondInstallmentStatus(String secondInstallmentStatus) { this.secondInstallmentStatus = secondInstallmentStatus; }

    public LocalDateTime getSecondInstallmentPaidAt() { return secondInstallmentPaidAt; }
    public void setSecondInstallmentPaidAt(LocalDateTime secondInstallmentPaidAt) { this.secondInstallmentPaidAt = secondInstallmentPaidAt; }

    public BigDecimal getThirdInstallment() { return thirdInstallment; }
    public void setThirdInstallment(BigDecimal thirdInstallment) { this.thirdInstallment = thirdInstallment; }

    public String getThirdInstallmentStatus() { return thirdInstallmentStatus; }
    public void setThirdInstallmentStatus(String thirdInstallmentStatus) { this.thirdInstallmentStatus = thirdInstallmentStatus; }

    public LocalDateTime getThirdInstallmentPaidAt() { return thirdInstallmentPaidAt; }
    public void setThirdInstallmentPaidAt(LocalDateTime thirdInstallmentPaidAt) { this.thirdInstallmentPaidAt = thirdInstallmentPaidAt; }

    public BigDecimal getFourthInstallment() { return fourthInstallment; }
    public void setFourthInstallment(BigDecimal fourthInstallment) { this.fourthInstallment = fourthInstallment; }

    public String getFourthInstallmentStatus() { return fourthInstallmentStatus; }
    public void setFourthInstallmentStatus(String fourthInstallmentStatus) { this.fourthInstallmentStatus = fourthInstallmentStatus; }

    public LocalDateTime getFourthInstallmentPaidAt() { return fourthInstallmentPaidAt; }
    public void setFourthInstallmentPaidAt(LocalDateTime fourthInstallmentPaidAt) { this.fourthInstallmentPaidAt = fourthInstallmentPaidAt; }
}
