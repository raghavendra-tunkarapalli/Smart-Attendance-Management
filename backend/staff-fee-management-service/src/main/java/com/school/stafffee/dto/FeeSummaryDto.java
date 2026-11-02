package com.school.stafffee.dto;

import java.math.BigDecimal;

public class FeeSummaryDto {
    private long totalStudents;
    private long fullyPaidStudents;
    private long partiallyPaidStudents;
    private long unpaidStudents;
    private BigDecimal totalExpectedAmount = BigDecimal.ZERO;
    private BigDecimal totalCollectedAmount = BigDecimal.ZERO;
    private BigDecimal totalDueAmount = BigDecimal.ZERO;
    private double collectionPercentage = 0.0;

    public FeeSummaryDto() {
    }

    public long getTotalStudents() {
        return totalStudents;
    }

    public void setTotalStudents(long totalStudents) {
        this.totalStudents = totalStudents;
    }

    public long getFullyPaidStudents() {
        return fullyPaidStudents;
    }

    public void setFullyPaidStudents(long fullyPaidStudents) {
        this.fullyPaidStudents = fullyPaidStudents;
    }

    public long getPartiallyPaidStudents() {
        return partiallyPaidStudents;
    }

    public void setPartiallyPaidStudents(long partiallyPaidStudents) {
        this.partiallyPaidStudents = partiallyPaidStudents;
    }

    public long getUnpaidStudents() {
        return unpaidStudents;
    }

    public void setUnpaidStudents(long unpaidStudents) {
        this.unpaidStudents = unpaidStudents;
    }

    public BigDecimal getTotalExpectedAmount() {
        return totalExpectedAmount;
    }

    public void setTotalExpectedAmount(BigDecimal totalExpectedAmount) {
        this.totalExpectedAmount = totalExpectedAmount;
    }

    public BigDecimal getTotalCollectedAmount() {
        return totalCollectedAmount;
    }

    public void setTotalCollectedAmount(BigDecimal totalCollectedAmount) {
        this.totalCollectedAmount = totalCollectedAmount;
    }

    public BigDecimal getTotalDueAmount() {
        return totalDueAmount;
    }

    public void setTotalDueAmount(BigDecimal totalDueAmount) {
        this.totalDueAmount = totalDueAmount;
    }

    public double getCollectionPercentage() {
        return collectionPercentage;
    }

    public void setCollectionPercentage(double collectionPercentage) {
        this.collectionPercentage = collectionPercentage;
    }
}
