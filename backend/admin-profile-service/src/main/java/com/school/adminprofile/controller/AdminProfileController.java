package com.school.adminprofile.controller;

import com.school.adminprofile.dto.*;
import com.school.adminprofile.service.AdminProfileAnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin-profile")
@CrossOrigin(origins = "*")
public class AdminProfileController {

    private final AdminProfileAnalyticsService analyticsService;

    public AdminProfileController(AdminProfileAnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> resp = new HashMap<>();
        resp.put("status", "UP");
        resp.put("service", "admin-profile-service");
        resp.put("port", 8107);
        resp.put("timestamp", LocalDateTime.now().toString());
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/years")
    public ResponseEntity<List<Integer>> getYears() {
        return ResponseEntity.ok(analyticsService.getAvailableYears());
    }

    @GetMapping("/monthly-analytics")
    public ResponseEntity<List<MonthlyStatDto>> getMonthlyAnalytics(
            @RequestParam(required = false, defaultValue = "2026") int year) {
        return ResponseEntity.ok(analyticsService.getMonthlyTrends(year));
    }

    @GetMapping("/summary")
    public ResponseEntity<AnalyticsSummaryDto> getSummary(
            @RequestParam(required = false, defaultValue = "2026") int year,
            @RequestParam(required = false) Integer month) {
        return ResponseEntity.ok(analyticsService.getAnalyticsSummary(year, month));
    }

    @GetMapping("/drilldown")
    public ResponseEntity<MonthlyDrilldownDto> getDrilldown(
            @RequestParam(required = false, defaultValue = "2026") int year,
            @RequestParam(required = false) Integer month) {
        return ResponseEntity.ok(analyticsService.getMonthlyDrilldown(year, month));
    }

    @GetMapping("/admissions")
    public ResponseEntity<List<AdmissionItemDto>> getAdmissions(
            @RequestParam(required = false, defaultValue = "2026") int year,
            @RequestParam(required = false) Integer month) {
        return ResponseEntity.ok(analyticsService.getAdmissionsList(year, month));
    }

    @GetMapping("/payments")
    public ResponseEntity<List<PaymentTransactionDto>> getTransactions(
            @RequestParam(required = false, defaultValue = "2026") int year,
            @RequestParam(required = false) Integer month) {
        return ResponseEntity.ok(analyticsService.getTransactionsList(year, month));
    }

    @GetMapping("/student-fees")
    public ResponseEntity<List<StudentFeeSummaryDto>> getStudentFees() {
        return ResponseEntity.ok(analyticsService.getStudentFeeSummaries());
    }
}

