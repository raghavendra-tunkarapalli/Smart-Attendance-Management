package com.school.parenttuitionfee.dto;

import java.math.BigDecimal;

public class PaymentInitiateRequest {

    private String studentId;
    private String childName;
    private String installmentName;
    private BigDecimal amount;
    private String paymentMethod;
    private String payerName;
    private String payerEmail;
    private String payerPhone;
    private String remarks;

    public PaymentInitiateRequest() {}

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getChildName() { return childName; }
    public void setChildName(String childName) { this.childName = childName; }

    public String getInstallmentName() { return installmentName; }
    public void setInstallmentName(String installmentName) { this.installmentName = installmentName; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getPayerName() { return payerName; }
    public void setPayerName(String payerName) { this.payerName = payerName; }

    public String getPayerEmail() { return payerEmail; }
    public void setPayerEmail(String payerEmail) { this.payerEmail = payerEmail; }

    public String getPayerPhone() { return payerPhone; }
    public void setPayerPhone(String payerPhone) { this.payerPhone = payerPhone; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
