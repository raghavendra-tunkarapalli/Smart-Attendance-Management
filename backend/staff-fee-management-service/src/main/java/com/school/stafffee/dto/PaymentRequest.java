package com.school.stafffee.dto;

import java.math.BigDecimal;

public class PaymentRequest {
    private int installmentNumber;
    private BigDecimal amount;
    private String paymentMethod;
    private String remarks;

    public PaymentRequest() {
    }

    public PaymentRequest(int installmentNumber, BigDecimal amount, String paymentMethod, String remarks) {
        this.installmentNumber = installmentNumber;
        this.amount = amount;
        this.paymentMethod = paymentMethod;
        this.remarks = remarks;
    }

    public int getInstallmentNumber() {
        return installmentNumber;
    }

    public void setInstallmentNumber(int installmentNumber) {
        this.installmentNumber = installmentNumber;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}
