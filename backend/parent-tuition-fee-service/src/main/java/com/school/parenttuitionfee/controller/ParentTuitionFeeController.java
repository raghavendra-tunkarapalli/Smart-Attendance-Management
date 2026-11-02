package com.school.parenttuitionfee.controller;

import com.school.parenttuitionfee.dto.ChildFeeDetailDto;
import com.school.parenttuitionfee.dto.PaymentInitiateRequest;
import com.school.parenttuitionfee.dto.PaymentInitiateResponse;
import com.school.parenttuitionfee.service.ParentTuitionFeeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/parent-tuition-fee")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "*"}, allowedHeaders = "*", allowCredentials = "false")
public class ParentTuitionFeeController {

    private final ParentTuitionFeeService tuitionFeeService;

    public ParentTuitionFeeController(ParentTuitionFeeService tuitionFeeService) {
        this.tuitionFeeService = tuitionFeeService;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> resp = new HashMap<>();
        resp.put("status", "UP");
        resp.put("service", "parent-tuition-fee-service");
        resp.put("port", 8104);
        resp.put("message", "Parent Tuition & Fee microservice is operational");
        resp.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(resp);
    }

    /**
     * Get fee statements for all children linked to this parent.
     */
    @GetMapping("/children/{parentUserId}")
    public ResponseEntity<List<ChildFeeDetailDto>> getChildrenFees(@PathVariable Long parentUserId) {
        List<ChildFeeDetailDto> list = tuitionFeeService.getChildrenFeeDetails(parentUserId);
        return ResponseEntity.ok(list);
    }

    /**
     * Get fee detail for a specific student ID.
     */
    @GetMapping("/child/{studentId}")
    public ResponseEntity<ChildFeeDetailDto> getChildFee(@PathVariable String studentId) {
        return tuitionFeeService.getStudentFeeDetail(studentId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Initiate payment intent for child fee.
     * Takes fee payment parameters and returns initialized response WITHOUT modifying DB records.
     */
    @PostMapping("/initiate-payment")
    public ResponseEntity<PaymentInitiateResponse> initiatePayment(@RequestBody PaymentInitiateRequest request) {
        PaymentInitiateResponse response = tuitionFeeService.initiatePayment(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Alias endpoint for pay button.
     */
    @PostMapping("/pay")
    public ResponseEntity<PaymentInitiateResponse> pay(@RequestBody PaymentInitiateRequest request) {
        return initiatePayment(request);
    }
}
