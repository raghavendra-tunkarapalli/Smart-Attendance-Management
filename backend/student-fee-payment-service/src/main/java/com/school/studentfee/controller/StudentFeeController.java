package com.school.studentfee.controller;

import com.school.studentfee.dto.FeeReceiptDto;
import com.school.studentfee.entity.StudentFeeDetail;
import com.school.studentfee.service.StudentFeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/student-fee")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"}, allowCredentials = "true")
public class StudentFeeController {

    @Autowired
    private StudentFeeService studentFeeService;

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> status = new HashMap<>();
        status.put("status", "UP");
        status.put("service", "STUDENT-FEE-PAYMENT-SERVICE");
        status.put("port", 8105);
        status.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(status);
    }

    /**
     * Retrieve the financial dues and installment records for the current student.
     */
    @GetMapping("/my-fee")
    public ResponseEntity<?> getMyFee(
            @RequestParam(required = false) String studentId,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String name) {
        return studentFeeService.getStudentFee(studentId, username, name)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Get JSON metadata for a paid installment receipt.
     * Enforces the rule: ONLY paid installments can generate a receipt.
     */
    @GetMapping("/receipt/{studentId}/{installmentNumber}")
    public ResponseEntity<?> getReceiptJson(
            @PathVariable String studentId,
            @PathVariable int installmentNumber) {
        try {
            FeeReceiptDto receipt = studentFeeService.getFeeReceipt(studentId, installmentNumber);
            return ResponseEntity.ok(receipt);
        } catch (IllegalStateException e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            err.put("code", "UNPAID_INSTALLMENT");
            return ResponseEntity.badRequest().body(err);
        } catch (IllegalArgumentException e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Failed to retrieve receipt: " + e.getMessage());
            return ResponseEntity.internalServerError().body(err);
        }
    }

    /**
     * Download an official HTML printable fee receipt.
     * Enforces the rule: ONLY paid installments can generate a receipt.
     */
    @GetMapping("/receipt/{studentId}/{installmentNumber}/download")
    public ResponseEntity<?> downloadReceiptHtml(
            @PathVariable String studentId,
            @PathVariable int installmentNumber) {
        try {
            FeeReceiptDto receipt = studentFeeService.getFeeReceipt(studentId, installmentNumber);
            String html = studentFeeService.generateReceiptHtml(receipt);
            String filename = "Fee_Receipt_" + receipt.getReceiptNumber() + ".html";

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(new MediaType("text", "html", StandardCharsets.UTF_8))
                    .body(html);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest()
                    .contentType(MediaType.TEXT_PLAIN)
                    .body("Error: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .contentType(MediaType.TEXT_PLAIN)
                    .body("Error generating receipt: " + e.getMessage());
        }
    }
}

