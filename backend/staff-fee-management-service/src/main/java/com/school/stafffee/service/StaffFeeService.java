package com.school.stafffee.service;

import com.school.stafffee.dto.FeeSummaryDto;
import com.school.stafffee.dto.PaymentRequest;
import com.school.stafffee.entity.StudentFeeDetail;
import com.school.stafffee.repository.StudentFeeDetailRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class StaffFeeService {

    @Autowired
    private StudentFeeDetailRepository repository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * Determines the total fee and installment amounts based on class standard:
     * - Class 1 to 5: Total 40,000 (4 x 10,000)
     * - Class 6 to 8: Total 50,000 (4 x 12,500)
     * - Class 9, 10: Total 60,000 (4 x 15,000)
     * - Class 11, 12: Total 80,000 (4 x 20,000)
     */
    public BigDecimal calculateTotalFeeForClass(String classStandard) {
        if (classStandard == null) return BigDecimal.valueOf(60000);
        String cleaned = classStandard.trim().replaceAll("[^0-9]", "");
        int c = 10;
        try {
            if (!cleaned.isEmpty()) {
                c = Integer.parseInt(cleaned);
            }
        } catch (NumberFormatException ignored) {}

        if (c >= 1 && c <= 5) {
            return BigDecimal.valueOf(40000);
        } else if (c >= 6 && c <= 8) {
            return BigDecimal.valueOf(50000);
        } else if (c >= 9 && c <= 10) {
            return BigDecimal.valueOf(60000);
        } else if (c >= 11 && c <= 12) {
            return BigDecimal.valueOf(80000);
        }
        return BigDecimal.valueOf(60000);
    }

    public List<StudentFeeDetail> getStudents(String classStandard, String sectionName, String feeStatus, String search) {
        List<StudentFeeDetail> list;

        if (classStandard != null && !classStandard.trim().isEmpty() && !classStandard.equalsIgnoreCase("ALL")) {
            if (sectionName != null && !sectionName.trim().isEmpty() && !sectionName.equalsIgnoreCase("ALL")) {
                list = repository.findByClassStandardAndSectionName(classStandard.trim(), sectionName.trim());
            } else {
                list = repository.findByClassStandard(classStandard.trim());
            }
        } else if (sectionName != null && !sectionName.trim().isEmpty() && !sectionName.equalsIgnoreCase("ALL")) {
            list = repository.findBySectionName(sectionName.trim());
        } else {
            list = repository.findAll();
        }

        return list.stream()
                .filter(s -> {
                    if (feeStatus != null && !feeStatus.trim().isEmpty() && !feeStatus.equalsIgnoreCase("ALL")) {
                        if (!feeStatus.equalsIgnoreCase(s.getFeeStatus())) {
                            return false;
                        }
                    }
                    if (search != null && !search.trim().isEmpty()) {
                        String q = search.trim().toLowerCase();
                        boolean matchId = s.getStudentId() != null && s.getStudentId().toLowerCase().contains(q);
                        boolean matchFirst = s.getFirstName() != null && s.getFirstName().toLowerCase().contains(q);
                        boolean matchLast = s.getLastName() != null && s.getLastName().toLowerCase().contains(q);
                        boolean matchParent = s.getParentName() != null && s.getParentName().toLowerCase().contains(q);
                        if (!matchId && !matchFirst && !matchLast && !matchParent) {
                            return false;
                        }
                    }
                    return true;
                })
                .sorted(Comparator.comparing(StudentFeeDetail::getClassStandard, Comparator.nullsLast(Comparator.naturalOrder()))
                        .thenComparing(StudentFeeDetail::getSectionName, Comparator.nullsLast(Comparator.naturalOrder()))
                        .thenComparing(StudentFeeDetail::getFirstName, Comparator.nullsLast(Comparator.naturalOrder())))
                .collect(Collectors.toList());
    }

    public Optional<StudentFeeDetail> getStudentById(String studentId) {
        return repository.findById(studentId);
    }

    @Transactional
    public StudentFeeDetail payInstallment(String studentId, PaymentRequest request) {
        StudentFeeDetail student = repository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found with ID: " + studentId));

        int installmentNum = request.getInstallmentNumber();
        LocalDateTime paidTime = LocalDateTime.now();

        switch (installmentNum) {
            case 1:
                student.setFirstInstallmentStatus("PAID");
                student.setFirstInstallmentPaidAt(paidTime);
                break;
            case 2:
                student.setSecondInstallmentStatus("PAID");
                student.setSecondInstallmentPaidAt(paidTime);
                break;
            case 3:
                student.setThirdInstallmentStatus("PAID");
                student.setThirdInstallmentPaidAt(paidTime);
                break;
            case 4:
                student.setFourthInstallmentStatus("PAID");
                student.setFourthInstallmentPaidAt(paidTime);
                break;
            default:
                throw new IllegalArgumentException("Installment number must be between 1 and 4.");
        }

        student.recalculateTotals();
        return repository.save(student);
    }

    public FeeSummaryDto getSummary(String classStandard, String sectionName) {
        List<StudentFeeDetail> students = getStudents(classStandard, sectionName, "ALL", null);

        FeeSummaryDto summary = new FeeSummaryDto();
        summary.setTotalStudents(students.size());

        long fullyPaid = 0;
        long partiallyPaid = 0;
        long unpaid = 0;
        BigDecimal totalExpected = BigDecimal.ZERO;
        BigDecimal totalCollected = BigDecimal.ZERO;
        BigDecimal totalDue = BigDecimal.ZERO;

        for (StudentFeeDetail s : students) {
            if ("PAID".equalsIgnoreCase(s.getFeeStatus())) {
                fullyPaid++;
            } else if ("PARTIAL".equalsIgnoreCase(s.getFeeStatus())) {
                partiallyPaid++;
            } else {
                unpaid++;
            }

            if (s.getTotalAmount() != null) {
                totalExpected = totalExpected.add(s.getTotalAmount());
            }
            if (s.getTotalAmountPaid() != null) {
                totalCollected = totalCollected.add(s.getTotalAmountPaid());
            }
            if (s.getDueAmount() != null) {
                totalDue = totalDue.add(s.getDueAmount());
            }
        }

        summary.setFullyPaidStudents(fullyPaid);
        summary.setPartiallyPaidStudents(partiallyPaid);
        summary.setUnpaidStudents(unpaid);
        summary.setTotalExpectedAmount(totalExpected);
        summary.setTotalCollectedAmount(totalCollected);
        summary.setTotalDueAmount(totalDue);

        if (totalExpected.compareTo(BigDecimal.ZERO) > 0) {
            double rate = totalCollected.multiply(BigDecimal.valueOf(100))
                    .divide(totalExpected, 2, RoundingMode.HALF_UP)
                    .doubleValue();
            summary.setCollectionPercentage(rate);
        } else {
            summary.setCollectionPercentage(0.0);
        }

        return summary;
    }

    public List<String> getAvailableClasses() {
        return repository.findDistinctClasses();
    }

    public List<String> getAvailableSections() {
        return repository.findDistinctSections();
    }

    @Transactional
    public int syncFromStudentDetails() {
        String sql = "SELECT student_id, first_name, last_name, parent_name, class_standard, section_name FROM student_details";
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql);

        int updatedCount = 0;
        for (Map<String, Object> row : rows) {
            String sid = (String) row.get("student_id");
            if (sid == null || sid.trim().isEmpty()) continue;

            String classStd = row.get("class_standard") != null ? row.get("class_standard").toString() : "10";
            String section = row.get("section_name") != null ? row.get("section_name").toString() : "A";
            String first = row.get("first_name") != null ? row.get("first_name").toString() : "";
            String last = row.get("last_name") != null ? row.get("last_name").toString() : "";
            String parent = row.get("parent_name") != null ? row.get("parent_name").toString() : "";

            BigDecimal total = calculateTotalFeeForClass(classStd);
            BigDecimal perInstallment = total.divide(BigDecimal.valueOf(4), 2, RoundingMode.HALF_UP);

            Optional<StudentFeeDetail> existingOpt = repository.findById(sid);
            if (existingOpt.isPresent()) {
                StudentFeeDetail existing = existingOpt.get();
                boolean changed = false;
                if (!total.equals(existing.getTotalAmount())) {
                    existing.setTotalAmount(total);
                    existing.setFirstInstallment(perInstallment);
                    existing.setSecondInstallment(perInstallment);
                    existing.setThirdInstallment(perInstallment);
                    existing.setFourthInstallment(perInstallment);
                    changed = true;
                }
                if (first != null && !first.equals(existing.getFirstName())) {
                    existing.setFirstName(first);
                    changed = true;
                }
                if (parent != null && !parent.equals(existing.getParentName())) {
                    existing.setParentName(parent);
                    changed = true;
                }
                if (existing.getParentPhone() == null || existing.getParentPhone().isEmpty()) {
                    existing.setParentPhone("+1 (555) 349-8201");
                    changed = true;
                }
                if (changed) {
                    existing.recalculateTotals();
                    repository.save(existing);
                    updatedCount++;
                }
            } else {
                StudentFeeDetail newFee = new StudentFeeDetail();
                newFee.setStudentId(sid);
                newFee.setFirstName(first);
                newFee.setLastName(last);
                newFee.setParentName(parent);
                newFee.setParentPhone("+1 (555) 349-8201");
                newFee.setClassStandard(classStd);
                newFee.setSectionName(section);
                newFee.setTotalAmount(total);
                newFee.setFirstInstallment(perInstallment);
                newFee.setSecondInstallment(perInstallment);
                newFee.setThirdInstallment(perInstallment);
                newFee.setFourthInstallment(perInstallment);
                newFee.setFirstInstallmentStatus("PENDING");
                newFee.setSecondInstallmentStatus("PENDING");
                newFee.setThirdInstallmentStatus("PENDING");
                newFee.setFourthInstallmentStatus("PENDING");
                newFee.recalculateTotals();
                repository.save(newFee);
                updatedCount++;
            }
        }
        return updatedCount;
    }
}
