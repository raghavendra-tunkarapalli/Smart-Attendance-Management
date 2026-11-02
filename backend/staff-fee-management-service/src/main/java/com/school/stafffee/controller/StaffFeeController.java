package com.school.stafffee.controller;

import com.school.stafffee.dto.FeeSummaryDto;
import com.school.stafffee.dto.PaymentRequest;
import com.school.stafffee.entity.StudentFeeDetail;
import com.school.stafffee.service.StaffFeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/staff-fee")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"}, allowCredentials = "true")
public class StaffFeeController {

    @Autowired
    private StaffFeeService feeService;

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> status = new HashMap<>();
        status.put("status", "UP");
        status.put("service", "STAFF-FEE-MANAGEMENT-SERVICE");
        status.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(status);
    }

    @GetMapping("/students")
    public ResponseEntity<List<StudentFeeDetail>> getAllStudents(
            @RequestParam(required = false) String classStandard,
            @RequestParam(required = false) String sectionName,
            @RequestParam(required = false) String feeStatus,
            @RequestParam(required = false) String search) {
        List<StudentFeeDetail> students = feeService.getStudents(classStandard, sectionName, feeStatus, search);
        return ResponseEntity.ok(students);
    }

    @GetMapping("/students/{studentId}")
    public ResponseEntity<StudentFeeDetail> getStudentFeeById(@PathVariable String studentId) {
        return feeService.getStudentById(studentId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/students/{studentId}/pay")
    public ResponseEntity<?> payInstallment(
            @PathVariable String studentId,
            @RequestBody PaymentRequest request) {
        try {
            StudentFeeDetail updated = feeService.payInstallment(studentId, request);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Failed to process payment: " + e.getMessage());
            return ResponseEntity.internalServerError().body(err);
        }
    }

    @GetMapping("/summary")
    public ResponseEntity<FeeSummaryDto> getSummary(
            @RequestParam(required = false) String classStandard,
            @RequestParam(required = false) String sectionName) {
        FeeSummaryDto summary = feeService.getSummary(classStandard, sectionName);
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/classes")
    public ResponseEntity<List<String>> getClasses() {
        return ResponseEntity.ok(feeService.getAvailableClasses());
    }

    @GetMapping("/sections")
    public ResponseEntity<List<String>> getSections() {
        return ResponseEntity.ok(feeService.getAvailableSections());
    }

    @PostMapping("/sync")
    public ResponseEntity<Map<String, Object>> syncStudents() {
        int count = feeService.syncFromStudentDetails();
        Map<String, Object> resp = new HashMap<>();
        resp.put("message", "Synced students successfully");
        resp.put("syncedCount", count);
        return ResponseEntity.ok(resp);
    }
}
