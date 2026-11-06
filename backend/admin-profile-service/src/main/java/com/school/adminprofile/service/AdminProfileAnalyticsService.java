package com.school.adminprofile.service;

import com.school.adminprofile.dto.*;
import com.school.adminprofile.entity.StudentAdmissionEntity;
import com.school.adminprofile.entity.StudentFeeEntity;
import com.school.adminprofile.repository.StudentAdmissionRepository;
import com.school.adminprofile.repository.StudentFeeRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminProfileAnalyticsService {

    private static final String[] MONTH_NAMES = {
        "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    };

    private static final String[] FULL_MONTH_NAMES = {
        "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
    };

    private static final DateTimeFormatter DISPLAY_DT_FMT = DateTimeFormatter.ofPattern("MMM dd, yyyy hh:mm a");

    private final StudentAdmissionRepository admissionRepository;
    private final StudentFeeRepository feeRepository;

    public AdminProfileAnalyticsService(StudentAdmissionRepository admissionRepository,
                                        StudentFeeRepository feeRepository) {
        this.admissionRepository = admissionRepository;
        this.feeRepository = feeRepository;
    }

    public List<Integer> getAvailableYears() {
        Set<Integer> years = new TreeSet<>(Collections.reverseOrder());
        List<Integer> admissionYears = admissionRepository.findDistinctYears();
        if (admissionYears != null) {
            years.addAll(admissionYears);
        }

        List<StudentFeeEntity> fees = feeRepository.findAll();
        for (StudentFeeEntity f : fees) {
            addYearIfPresent(years, f.getFirstInstallmentPaidAt());
            addYearIfPresent(years, f.getSecondInstallmentPaidAt());
            addYearIfPresent(years, f.getThirdInstallmentPaidAt());
            addYearIfPresent(years, f.getFourthInstallmentPaidAt());
        }

        if (years.isEmpty()) {
            years.add(LocalDateTime.now().getYear());
        }
        // Always include current year and previous year for good UX
        years.add(2026);
        years.add(2025);

        return new ArrayList<>(years);
    }

    private void addYearIfPresent(Set<Integer> set, LocalDateTime dt) {
        if (dt != null) {
            set.add(dt.getYear());
        }
    }

    public List<MonthlyStatDto> getMonthlyTrends(int year) {
        Map<Integer, MonthlyStatDto> statsMap = new LinkedHashMap<>();
        for (int m = 1; m <= 12; m++) {
            statsMap.put(m, new MonthlyStatDto(m, MONTH_NAMES[m - 1], year));
        }

        // 1. Process Admissions
        List<StudentAdmissionEntity> admissions = admissionRepository.findByYear(year);
        for (StudentAdmissionEntity adm : admissions) {
            if (adm.getCreatedAt() != null) {
                int m = adm.getCreatedAt().getMonthValue();
                MonthlyStatDto stat = statsMap.get(m);
                if (stat != null) {
                    stat.setAdmissionsCount(stat.getAdmissionsCount() + 1);
                    String st = adm.getStatus() != null ? adm.getStatus().toUpperCase() : "PENDING";
                    if ("ACCEPTED".equals(st) || "CONFIRMED".equals(st)) {
                        stat.setConfirmedAdmissions(stat.getConfirmedAdmissions() + 1);
                    } else {
                        stat.setPendingAdmissions(stat.getPendingAdmissions() + 1);
                    }
                }
            }
        }

        // 2. Process Parent Payments (across 4 installments)
        List<StudentFeeEntity> feeList = feeRepository.findAll();
        for (StudentFeeEntity f : feeList) {
            processInstallmentPayment(statsMap, year, f.getFirstInstallmentPaidAt(), f.getFirstInstallment());
            processInstallmentPayment(statsMap, year, f.getSecondInstallmentPaidAt(), f.getSecondInstallment());
            processInstallmentPayment(statsMap, year, f.getThirdInstallmentPaidAt(), f.getThirdInstallment());
            processInstallmentPayment(statsMap, year, f.getFourthInstallmentPaidAt(), f.getFourthInstallment());
        }

        return new ArrayList<>(statsMap.values());
    }

    private void processInstallmentPayment(Map<Integer, MonthlyStatDto> statsMap, int targetYear,
                                           LocalDateTime paidAt, BigDecimal amount) {
        if (paidAt != null && paidAt.getYear() == targetYear && amount != null && amount.compareTo(BigDecimal.ZERO) > 0) {
            int m = paidAt.getMonthValue();
            MonthlyStatDto stat = statsMap.get(m);
            if (stat != null) {
                stat.setParentPaymentsAmount(stat.getParentPaymentsAmount().add(amount));
                stat.setTransactionCount(stat.getTransactionCount() + 1);
            }
        }
    }

    public AnalyticsSummaryDto getAnalyticsSummary(int year, Integer month) {
        List<MonthlyStatDto> monthlyTrends = getMonthlyTrends(year);

        AnalyticsSummaryDto summary = new AnalyticsSummaryDto();
        summary.setSelectedYear(year);
        summary.setSelectedMonth(month);
        summary.setSelectedMonthName(month != null && month >= 1 && month <= 12 ? FULL_MONTH_NAMES[month - 1] : "All Months");

        long totalAdm = 0;
        long confAdm = 0;
        long pendAdm = 0;
        BigDecimal totalPayments = BigDecimal.ZERO;
        long totalTx = 0;

        String peakAdmMonth = "—";
        long maxAdm = -1;
        String peakPayMonth = "—";
        BigDecimal maxPay = BigDecimal.ZERO;

        for (MonthlyStatDto m : monthlyTrends) {
            if (month == null || month <= 0 || m.getMonth() == month) {
                totalAdm += m.getAdmissionsCount();
                confAdm += m.getConfirmedAdmissions();
                pendAdm += m.getPendingAdmissions();
                totalPayments = totalPayments.add(m.getParentPaymentsAmount());
                totalTx += m.getTransactionCount();
            }

            if (m.getAdmissionsCount() > maxAdm && m.getAdmissionsCount() > 0) {
                maxAdm = m.getAdmissionsCount();
                peakAdmMonth = FULL_MONTH_NAMES[m.getMonth() - 1] + " (" + maxAdm + ")";
            }

            if (m.getParentPaymentsAmount().compareTo(maxPay) > 0) {
                maxPay = m.getParentPaymentsAmount();
                peakPayMonth = FULL_MONTH_NAMES[m.getMonth() - 1] + " (₹" + maxPay.setScale(0, RoundingMode.HALF_UP) + ")";
            }
        }

        summary.setTotalAdmissions(totalAdm);
        summary.setConfirmedAdmissions(confAdm);
        summary.setPendingAdmissions(pendAdm);
        summary.setTotalParentPayments(totalPayments);
        summary.setTotalTransactions(totalTx);

        int divisor = (month != null && month >= 1 && month <= 12) ? 1 : 12;
        summary.setAvgMonthlyPayments(totalPayments.divide(BigDecimal.valueOf(divisor), 2, RoundingMode.HALF_UP));

        summary.setPeakAdmissionMonth(peakAdmMonth);
        summary.setPeakPaymentMonth(peakPayMonth);

        // Active students count
        summary.setActiveStudents(feeRepository.count());

        return summary;
    }

    public List<AdmissionItemDto> getAdmissionsList(int year, Integer month) {
        List<StudentAdmissionEntity> list;
        if (month != null && month >= 1 && month <= 12) {
            list = admissionRepository.findByYearAndMonth(year, month);
        } else {
            list = admissionRepository.findByYear(year);
        }

        return list.stream().map(a -> {
            String createdStr = a.getCreatedAt() != null ? a.getCreatedAt().format(DISPLAY_DT_FMT) : "—";
            return new AdmissionItemDto(
                a.getId(),
                a.getAdmissionId(),
                a.getResolvedStudentName(),
                a.getClassName(),
                a.getSection() != null ? a.getSection() : "A",
                a.getParentName(),
                a.getParentEmail(),
                a.getStatus() != null ? a.getStatus() : "PENDING",
                createdStr
            );
        }).collect(Collectors.toList());
    }

    private static class TxEntry {
        LocalDateTime timestamp;
        PaymentTransactionDto dto;

        TxEntry(LocalDateTime timestamp, PaymentTransactionDto dto) {
            this.timestamp = timestamp;
            this.dto = dto;
        }
    }

    public List<PaymentTransactionDto> getTransactionsList(int year, Integer month) {
        List<StudentFeeEntity> allFees = feeRepository.findAll();
        List<TxEntry> entries = new ArrayList<>();

        for (StudentFeeEntity f : allFees) {
            String studentName = ((f.getFirstName() != null ? f.getFirstName() : "") + " " +
                                  (f.getLastName() != null ? f.getLastName() : "")).trim();

            checkAndAddTransaction(entries, f, "1st Term Installment", f.getFirstInstallment(),
                                   f.getFirstInstallmentPaidAt(), f.getFirstInstallmentStatus(), year, month, studentName);
            checkAndAddTransaction(entries, f, "2nd Term Installment", f.getSecondInstallment(),
                                   f.getSecondInstallmentPaidAt(), f.getSecondInstallmentStatus(), year, month, studentName);
            checkAndAddTransaction(entries, f, "3rd Term Installment", f.getThirdInstallment(),
                                   f.getThirdInstallmentPaidAt(), f.getThirdInstallmentStatus(), year, month, studentName);
            checkAndAddTransaction(entries, f, "4th Term Installment", f.getFourthInstallment(),
                                   f.getFourthInstallmentPaidAt(), f.getFourthInstallmentStatus(), year, month, studentName);
        }

        // Sort latest transactions first strictly by timestamp
        entries.sort((a, b) -> b.timestamp.compareTo(a.timestamp));
        return entries.stream().map(e -> e.dto).collect(Collectors.toList());
    }

    public BigDecimal calculateStudentTotalPaid(StudentFeeEntity fee) {
        BigDecimal total = BigDecimal.ZERO;
        if ("PAID".equalsIgnoreCase(fee.getFirstInstallmentStatus()) && fee.getFirstInstallment() != null) {
            total = total.add(fee.getFirstInstallment());
        }
        if ("PAID".equalsIgnoreCase(fee.getSecondInstallmentStatus()) && fee.getSecondInstallment() != null) {
            total = total.add(fee.getSecondInstallment());
        }
        if ("PAID".equalsIgnoreCase(fee.getThirdInstallmentStatus()) && fee.getThirdInstallment() != null) {
            total = total.add(fee.getThirdInstallment());
        }
        if ("PAID".equalsIgnoreCase(fee.getFourthInstallmentStatus()) && fee.getFourthInstallment() != null) {
            total = total.add(fee.getFourthInstallment());
        }
        return total;
    }

    public List<StudentFeeSummaryDto> getStudentFeeSummaries() {
        List<StudentFeeEntity> allFees = feeRepository.findAll();
        List<StudentFeeSummaryDto> summaries = new ArrayList<>();

        for (StudentFeeEntity f : allFees) {
            String studentName = ((f.getFirstName() != null ? f.getFirstName() : "") + " " +
                                  (f.getLastName() != null ? f.getLastName() : "")).trim();

            BigDecimal totalFee = f.getTotalAmount() != null ? f.getTotalAmount() : BigDecimal.ZERO;
            BigDecimal totalPaid = calculateStudentTotalPaid(f);
            BigDecimal due = totalFee.subtract(totalPaid);
            if (due.compareTo(BigDecimal.ZERO) < 0) due = BigDecimal.ZERO;

            int termsCount = 0;
            if ("PAID".equalsIgnoreCase(f.getFirstInstallmentStatus())) termsCount++;
            if ("PAID".equalsIgnoreCase(f.getSecondInstallmentStatus())) termsCount++;
            if ("PAID".equalsIgnoreCase(f.getThirdInstallmentStatus())) termsCount++;
            if ("PAID".equalsIgnoreCase(f.getFourthInstallmentStatus())) termsCount++;

            int pct = 0;
            if (totalFee.compareTo(BigDecimal.ZERO) > 0) {
                pct = totalPaid.multiply(BigDecimal.valueOf(100)).divide(totalFee, 0, RoundingMode.HALF_UP).intValue();
            }

            String overallStatus = totalPaid.compareTo(totalFee) >= 0 ? "PAID"
                                 : totalPaid.compareTo(BigDecimal.ZERO) > 0 ? "PARTIAL" : "UNPAID";

            StudentFeeSummaryDto dto = new StudentFeeSummaryDto();
            dto.setStudentId(f.getStudentId());
            dto.setStudentName(studentName);
            dto.setClassStandard(f.getClassStandard());
            dto.setSectionName(f.getSectionName() != null ? f.getSectionName() : "A");
            dto.setParentName(f.getParentName());
            dto.setParentPhone(f.getParentPhone());
            dto.setTotalAmount(totalFee);
            dto.setTotalAmountPaid(totalPaid);
            dto.setDueAmount(due);
            dto.setFeeStatus(overallStatus);
            dto.setPaidPercentage(pct);
            dto.setTermsPaidCount(termsCount);

            dto.setFirstInstallmentStatus(f.getFirstInstallmentStatus());
            dto.setFirstInstallmentPaidAt(f.getFirstInstallmentPaidAt() != null ? f.getFirstInstallmentPaidAt().format(DISPLAY_DT_FMT) : null);

            dto.setSecondInstallmentStatus(f.getSecondInstallmentStatus());
            dto.setSecondInstallmentPaidAt(f.getSecondInstallmentPaidAt() != null ? f.getSecondInstallmentPaidAt().format(DISPLAY_DT_FMT) : null);

            dto.setThirdInstallmentStatus(f.getThirdInstallmentStatus());
            dto.setThirdInstallmentPaidAt(f.getThirdInstallmentPaidAt() != null ? f.getThirdInstallmentPaidAt().format(DISPLAY_DT_FMT) : null);

            dto.setFourthInstallmentStatus(f.getFourthInstallmentStatus());
            dto.setFourthInstallmentPaidAt(f.getFourthInstallmentPaidAt() != null ? f.getFourthInstallmentPaidAt().format(DISPLAY_DT_FMT) : null);

            summaries.add(dto);
        }

        // Sort by total amount paid descending so highest payers / active students are first
        summaries.sort((a, b) -> b.getTotalAmountPaid().compareTo(a.getTotalAmountPaid()));
        return summaries;
    }

    private void checkAndAddTransaction(List<TxEntry> list, StudentFeeEntity fee,
                                        String instName, BigDecimal amount, LocalDateTime paidAt,
                                        String status, int targetYear, Integer targetMonth, String studentName) {
        if (paidAt != null && paidAt.getYear() == targetYear) {
            if (targetMonth == null || targetMonth <= 0 || paidAt.getMonthValue() == targetMonth) {
                String txId = "TXN-" + fee.getStudentId() + "-" + paidAt.getMonthValue() + "-" + Math.abs(instName.hashCode() % 1000);
                PaymentTransactionDto dto = new PaymentTransactionDto(
                    txId,
                    fee.getStudentId(),
                    studentName,
                    fee.getParentName(),
                    fee.getParentPhone(),
                    fee.getClassStandard(),
                    instName,
                    amount != null ? amount : BigDecimal.ZERO,
                    paidAt.format(DISPLAY_DT_FMT),
                    status != null ? status : "PAID"
                );

                BigDecimal studentTotalPaid = calculateStudentTotalPaid(fee);
                BigDecimal studentTotalFee = fee.getTotalAmount() != null ? fee.getTotalAmount() : BigDecimal.ZERO;
                BigDecimal studentDue = studentTotalFee.subtract(studentTotalPaid);
                if (studentDue.compareTo(BigDecimal.ZERO) < 0) studentDue = BigDecimal.ZERO;
                String overallStatus = studentTotalPaid.compareTo(studentTotalFee) >= 0 ? "PAID"
                                     : studentTotalPaid.compareTo(BigDecimal.ZERO) > 0 ? "PARTIAL" : "UNPAID";

                dto.setStudentTotalFee(studentTotalFee);
                dto.setStudentTotalPaid(studentTotalPaid);
                dto.setStudentDueAmount(studentDue);
                dto.setStudentOverallStatus(overallStatus);

                list.add(new TxEntry(paidAt, dto));
            }
        }
    }

    public MonthlyDrilldownDto getMonthlyDrilldown(int year, Integer month) {
        AnalyticsSummaryDto summary = getAnalyticsSummary(year, month);
        List<MonthlyStatDto> monthlyTrends = getMonthlyTrends(year);
        List<AdmissionItemDto> admissions = getAdmissionsList(year, month);
        List<PaymentTransactionDto> transactions = getTransactionsList(year, month);
        List<StudentFeeSummaryDto> studentFeeSummaries = getStudentFeeSummaries();

        String monthTitle = (month != null && month >= 1 && month <= 12) ? FULL_MONTH_NAMES[month - 1] : "All Months";

        return new MonthlyDrilldownDto(
            year,
            month,
            monthTitle,
            summary,
            monthlyTrends,
            admissions,
            transactions,
            studentFeeSummaries
        );
    }
}

