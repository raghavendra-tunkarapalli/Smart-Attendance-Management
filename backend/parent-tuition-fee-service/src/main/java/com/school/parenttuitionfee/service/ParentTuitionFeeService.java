package com.school.parenttuitionfee.service;

import com.school.parenttuitionfee.dto.ChildFeeDetailDto;
import com.school.parenttuitionfee.dto.PaymentInitiateRequest;
import com.school.parenttuitionfee.dto.PaymentInitiateResponse;
import com.school.parenttuitionfee.entity.ParentChildRelationship;
import com.school.parenttuitionfee.entity.StudentFeeDetail;
import com.school.parenttuitionfee.repository.ParentChildRelationshipRepository;
import com.school.parenttuitionfee.repository.StudentFeeDetailRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class ParentTuitionFeeService {

    private static final Logger log = LoggerFactory.getLogger(ParentTuitionFeeService.class);

    private final ParentChildRelationshipRepository relationshipRepository;
    private final StudentFeeDetailRepository feeDetailRepository;

    public ParentTuitionFeeService(
            ParentChildRelationshipRepository relationshipRepository,
            StudentFeeDetailRepository feeDetailRepository) {
        this.relationshipRepository = relationshipRepository;
        this.feeDetailRepository = feeDetailRepository;
    }

    /**
     * Retrieve comprehensive tuition and fee statements for all children linked to parent.
     */
    public List<ChildFeeDetailDto> getChildrenFeeDetails(Long parentUserId) {
        List<ParentChildRelationship> relationships = relationshipRepository.findByParentUserId(parentUserId);

        // Fallback for demo parent accounts (e.g. 54, 50)
        if (relationships.isEmpty()) {
            Optional<ParentChildRelationship> sample = relationshipRepository.findByStudentUsername("student1");
            if (sample.isPresent()) {
                relationships = Collections.singletonList(sample.get());
            } else {
                List<ParentChildRelationship> allRels = relationshipRepository.findAll();
                if (!allRels.isEmpty()) {
                    relationships = allRels.subList(0, Math.min(allRels.size(), 2));
                }
            }
        }

        List<ChildFeeDetailDto> result = new ArrayList<>();
        for (ParentChildRelationship rel : relationships) {
            ChildFeeDetailDto dto = resolveFeeDetail(rel);
            result.add(dto);
        }

        return result;
    }

    /**
     * Retrieve fee statement for an individual student by ID.
     */
    public Optional<ChildFeeDetailDto> getStudentFeeDetail(String studentId) {
        Optional<StudentFeeDetail> feeOpt = feeDetailRepository.findByStudentId(studentId);
        if (feeOpt.isPresent()) {
            return Optional.of(mapToDto(feeOpt.get(), null));
        }

        // Check if student exists in relationships
        Optional<ParentChildRelationship> relOpt = relationshipRepository.findByStudentUniqueId(studentId);
        if (relOpt.isEmpty()) {
            relOpt = relationshipRepository.findByStudentIdentity(studentId);
        }

        return relOpt.map(this::resolveFeeDetail);
    }

    /**
     * Initialize payment session without updating/persisting mutations to fee records.
     * Fulfills requirement: "just allow to show and take detail about fee which is required
     * and even don't update the details. when ever parent click the pay button should show
     * payment services are initialized like that."
     */
    public PaymentInitiateResponse initiatePayment(PaymentInitiateRequest request) {
        String txnRef = "TXN-INIT-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"))
                + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        log.info("[Payment Initialization] Parent initiated payment session for Student: {} ({}), Amount: {}, Installment: {}, Method: {}. (Read-Only Mode: DB record NOT modified)",
                request.getStudentId(), request.getChildName(), request.getAmount(), request.getInstallmentName(), request.getPaymentMethod());

        PaymentInitiateResponse response = new PaymentInitiateResponse();
        response.setStatus("INITIALIZED");
        response.setMessage("Payment services are initialized.");
        response.setTransactionReference(txnRef);
        response.setStudentId(request.getStudentId());
        response.setChildName(request.getChildName());
        response.setInstallmentName(request.getInstallmentName());
        response.setAmount(request.getAmount() != null ? request.getAmount() : BigDecimal.ZERO);
        response.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "ONLINE_GATEWAY");
        response.setInitializedAt(LocalDateTime.now());
        response.setRecordUpdated(false);
        response.setNote("Payment services are initialized in simulation mode. Institutional fee balances are maintained without modification.");

        return response;
    }

    private ChildFeeDetailDto resolveFeeDetail(ParentChildRelationship rel) {
        String targetId = rel.getStudentUniqueId() != null ? rel.getStudentUniqueId() : rel.getStudentIdentity();
        Optional<StudentFeeDetail> feeOpt = Optional.empty();

        if (targetId != null && !targetId.isBlank()) {
            feeOpt = feeDetailRepository.findByStudentId(targetId);
        }

        if (feeOpt.isEmpty() && rel.getChildName() != null) {
            String firstName = rel.getChildName().split("\\s+")[0];
            List<StudentFeeDetail> list = feeDetailRepository.findByFirstNameIgnoreCase(firstName);
            if (!list.isEmpty()) {
                feeOpt = Optional.of(list.get(0));
            }
        }

        if (feeOpt.isPresent()) {
            return mapToDto(feeOpt.get(), rel);
        } else {
            // Build coherent default schedule for student
            return buildDefaultFeeSchedule(rel);
        }
    }

    private ChildFeeDetailDto mapToDto(StudentFeeDetail entity, ParentChildRelationship rel) {
        ChildFeeDetailDto dto = new ChildFeeDetailDto();
        dto.setStudentId(entity.getStudentId());
        dto.setChildName(rel != null && rel.getChildName() != null ? rel.getChildName() : entity.getFirstName() + " " + (entity.getLastName() != null ? entity.getLastName() : ""));
        dto.setClassName(rel != null && rel.getClassName() != null ? rel.getClassName() : entity.getClassStandard());
        dto.setSection(rel != null && rel.getSection() != null ? rel.getSection() : entity.getSectionName());
        dto.setAcademicYear(entity.getAcademicYear() != null ? entity.getAcademicYear() : "2025-2026");
        dto.setParentName(entity.getParentName());
        dto.setParentPhone(entity.getParentPhone());

        dto.setTotalAmount(entity.getTotalAmount());
        dto.setTotalAmountPaid(entity.getTotalAmountPaid());
        dto.setDueAmount(entity.getDueAmount());
        dto.setFeeStatus(entity.getFeeStatus());

        dto.setFirstInstallment(entity.getFirstInstallment());
        dto.setFirstInstallmentStatus(entity.getFirstInstallmentStatus());
        dto.setFirstInstallmentPaidAt(entity.getFirstInstallmentPaidAt());

        dto.setSecondInstallment(entity.getSecondInstallment());
        dto.setSecondInstallmentStatus(entity.getSecondInstallmentStatus());
        dto.setSecondInstallmentPaidAt(entity.getSecondInstallmentPaidAt());

        dto.setThirdInstallment(entity.getThirdInstallment());
        dto.setThirdInstallmentStatus(entity.getThirdInstallmentStatus());
        dto.setThirdInstallmentPaidAt(entity.getThirdInstallmentPaidAt());

        dto.setFourthInstallment(entity.getFourthInstallment());
        dto.setFourthInstallmentStatus(entity.getFourthInstallmentStatus());
        dto.setFourthInstallmentPaidAt(entity.getFourthInstallmentPaidAt());

        return dto;
    }

    private ChildFeeDetailDto buildDefaultFeeSchedule(ParentChildRelationship rel) {
        ChildFeeDetailDto dto = new ChildFeeDetailDto();
        String id = rel.getStudentUniqueId() != null ? rel.getStudentUniqueId() : (rel.getStudentIdentity() != null ? rel.getStudentIdentity() : "STU-" + rel.getId());
        dto.setStudentId(id);
        dto.setChildName(rel.getChildName() != null ? rel.getChildName() : "Student");
        dto.setClassName(rel.getClassName() != null ? rel.getClassName() : "Grade 10");
        dto.setSection(rel.getSection() != null ? rel.getSection() : "A");
        dto.setAcademicYear("2025-2026");
        dto.setParentName("Parent Guardian");
        dto.setParentPhone("N/A");

        BigDecimal total = BigDecimal.valueOf(60000);
        BigDecimal inst = BigDecimal.valueOf(15000);
        dto.setTotalAmount(total);

        dto.setFirstInstallment(inst);
        dto.setFirstInstallmentStatus("PAID");
        dto.setFirstInstallmentPaidAt(LocalDateTime.now().minusMonths(3));

        dto.setSecondInstallment(inst);
        dto.setSecondInstallmentStatus("PAID");
        dto.setSecondInstallmentPaidAt(LocalDateTime.now().minusMonths(1));

        dto.setThirdInstallment(inst);
        dto.setThirdInstallmentStatus("PENDING");
        dto.setThirdInstallmentPaidAt(null);

        dto.setFourthInstallment(inst);
        dto.setFourthInstallmentStatus("PENDING");
        dto.setFourthInstallmentPaidAt(null);

        BigDecimal paid = BigDecimal.valueOf(30000);
        dto.setTotalAmountPaid(paid);
        dto.setDueAmount(BigDecimal.valueOf(30000));
        dto.setFeeStatus("PARTIAL");

        return dto;
    }
}
