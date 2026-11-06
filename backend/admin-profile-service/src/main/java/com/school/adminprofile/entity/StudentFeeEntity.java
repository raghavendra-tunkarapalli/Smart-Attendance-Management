package com.school.adminprofile.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_fee_details")
public class StudentFeeEntity {

    @Id
    @Column(name = "student_id", nullable = false, length = 50)
    private String studentId;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", length = 100)
    private String lastName;

    @Column(name = "parent_name", length = 150)
    private String parentName;

    @Column(name = "parent_phone", length = 50)
    private String parentPhone;

    @Column(name = "class_standard", nullable = false, length = 20)
    private String classStandard;

    @Column(name = "section_name", nullable = false, length = 20)
    private String sectionName;

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "first_installment", precision = 10, scale = 2)
    private BigDecimal firstInstallment;

    @Column(name = "first_installment_paid_at")
    private LocalDateTime firstInstallmentPaidAt;

    @Column(name = "first_installment_status", length = 30)
    private String firstInstallmentStatus;

    @Column(name = "second_installment", precision = 10, scale = 2)
    private BigDecimal secondInstallment;

    @Column(name = "second_installment_paid_at")
    private LocalDateTime secondInstallmentPaidAt;

    @Column(name = "second_installment_status", length = 30)
    private String secondInstallmentStatus;

    @Column(name = "third_installment", precision = 10, scale = 2)
    private BigDecimal thirdInstallment;

    @Column(name = "third_installment_paid_at")
    private LocalDateTime thirdInstallmentPaidAt;

    @Column(name = "third_installment_status", length = 30)
    private String thirdInstallmentStatus;

    @Column(name = "fourth_installment", precision = 10, scale = 2)
    private BigDecimal fourthInstallment;

    @Column(name = "fourth_installment_paid_at")
    private LocalDateTime fourthInstallmentPaidAt;

    @Column(name = "fourth_installment_status", length = 30)
    private String fourthInstallmentStatus;

    @Column(name = "total_amount_paid", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmountPaid = BigDecimal.ZERO;

    @Column(name = "due_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal dueAmount;

    @Column(name = "fee_status", length = 30)
    private String feeStatus;

    @Column(name = "academic_year", length = 30)
    private String academicYear;

    public StudentFeeEntity() {
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
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

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public BigDecimal getFirstInstallment() {
        return firstInstallment;
    }

    public void setFirstInstallment(BigDecimal firstInstallment) {
        this.firstInstallment = firstInstallment;
    }

    public LocalDateTime getFirstInstallmentPaidAt() {
        return firstInstallmentPaidAt;
    }

    public void setFirstInstallmentPaidAt(LocalDateTime firstInstallmentPaidAt) {
        this.firstInstallmentPaidAt = firstInstallmentPaidAt;
    }

    public String getFirstInstallmentStatus() {
        return firstInstallmentStatus;
    }

    public void setFirstInstallmentStatus(String firstInstallmentStatus) {
        this.firstInstallmentStatus = firstInstallmentStatus;
    }

    public BigDecimal getSecondInstallment() {
        return secondInstallment;
    }

    public void setSecondInstallment(BigDecimal secondInstallment) {
        this.secondInstallment = secondInstallment;
    }

    public LocalDateTime getSecondInstallmentPaidAt() {
        return secondInstallmentPaidAt;
    }

    public void setSecondInstallmentPaidAt(LocalDateTime secondInstallmentPaidAt) {
        this.secondInstallmentPaidAt = secondInstallmentPaidAt;
    }

    public String getSecondInstallmentStatus() {
        return secondInstallmentStatus;
    }

    public void setSecondInstallmentStatus(String secondInstallmentStatus) {
        this.secondInstallmentStatus = secondInstallmentStatus;
    }

    public BigDecimal getThirdInstallment() {
        return thirdInstallment;
    }

    public void setThirdInstallment(BigDecimal thirdInstallment) {
        this.thirdInstallment = thirdInstallment;
    }

    public LocalDateTime getThirdInstallmentPaidAt() {
        return thirdInstallmentPaidAt;
    }

    public void setThirdInstallmentPaidAt(LocalDateTime thirdInstallmentPaidAt) {
        this.thirdInstallmentPaidAt = thirdInstallmentPaidAt;
    }

    public String getThirdInstallmentStatus() {
        return thirdInstallmentStatus;
    }

    public void setThirdInstallmentStatus(String thirdInstallmentStatus) {
        this.thirdInstallmentStatus = thirdInstallmentStatus;
    }

    public BigDecimal getFourthInstallment() {
        return fourthInstallment;
    }

    public void setFourthInstallment(BigDecimal fourthInstallment) {
        this.fourthInstallment = fourthInstallment;
    }

    public LocalDateTime getFourthInstallmentPaidAt() {
        return fourthInstallmentPaidAt;
    }

    public void setFourthInstallmentPaidAt(LocalDateTime fourthInstallmentPaidAt) {
        this.fourthInstallmentPaidAt = fourthInstallmentPaidAt;
    }

    public String getFourthInstallmentStatus() {
        return fourthInstallmentStatus;
    }

    public void setFourthInstallmentStatus(String fourthInstallmentStatus) {
        this.fourthInstallmentStatus = fourthInstallmentStatus;
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

    public String getAcademicYear() {
        return academicYear;
    }

    public void setAcademicYear(String academicYear) {
        this.academicYear = academicYear;
    }
}

