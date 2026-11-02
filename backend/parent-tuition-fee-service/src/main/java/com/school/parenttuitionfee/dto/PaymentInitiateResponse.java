package com.school.parenttuitionfee.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PaymentInitiateResponse {

    private String status;               // "INITIALIZED"
    private String message;              // "Payment services are initialized."
    private String transactionReference; // "TXN-INIT-20261102..."
    private String studentId;
    private String childName;
    private String installmentName;
    private BigDecimal amount;
    private String paymentMethod;
    private LocalDateTime initializedAt;
    private boolean recordUpdated;       // false (per requirement: don't update details)
    private String note;                 // Notice that it is in initialized/simulation mode

    public PaymentInitiateResponse() {}

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getTransactionReference() { return transactionReference; }
    public void setTransactionReference(String transactionReference) { this.transactionReference = transactionReference; }

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

    public LocalDateTime getInitializedAt() { return initializedAt; }
    public void setInitializedAt(LocalDateTime initializedAt) { this.initializedAt = initializedAt; }

    public boolean isRecordUpdated() { return recordUpdated; }
    public void setRecordUpdated(boolean recordUpdated) { this.recordUpdated = recordUpdated; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
