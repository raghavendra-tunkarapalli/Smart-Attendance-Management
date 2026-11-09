package com.school.adminstaffdirectory.controller;

import com.school.adminstaffdirectory.dto.CreateDirectionRequest;
import com.school.adminstaffdirectory.dto.DirectoryStatsDto;
import com.school.adminstaffdirectory.dto.StaffMemberDto;
import com.school.adminstaffdirectory.entity.StaffDirection;
import com.school.adminstaffdirectory.service.AdminStaffDirectoryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/admin-staff-directory")
public class AdminStaffDirectoryController {

    private final AdminStaffDirectoryService directoryService;

    public AdminStaffDirectoryController(AdminStaffDirectoryService directoryService) {
        this.directoryService = directoryService;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "admin-staff-directory-service",
                "port", "8108"
        ));
    }

    @GetMapping("/staff")
    public ResponseEntity<List<StaffMemberDto>> getStaffDirectory() {
        return ResponseEntity.ok(directoryService.getAllStaff());
    }

    @GetMapping("/directions")
    public ResponseEntity<List<StaffDirection>> getDirections(
            @RequestParam(required = false) String targetStaffCode,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(directoryService.getAllDirections(targetStaffCode, status, priority, search));
    }

    @GetMapping("/directions/{id}")
    public ResponseEntity<StaffDirection> getDirectionById(@PathVariable Long id) {
        return directoryService.getDirectionById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/directions")
    public ResponseEntity<?> createDirection(@Valid @RequestBody CreateDirectionRequest request) {
        try {
            StaffDirection created = directoryService.createDirection(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/directions/{id}/status")
    public ResponseEntity<?> updateDirectionStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        String status = payload.get("status");
        if (status == null || status.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Status field is required"));
        }
        return directoryService.updateDirectionStatus(id, status)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/directions/{id}")
    public ResponseEntity<?> deleteDirection(@PathVariable Long id) {
        boolean deleted = directoryService.deleteDirection(id);
        if (deleted) {
            return ResponseEntity.ok(Map.of("message", "Direction removed successfully", "id", id));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<DirectoryStatsDto> getStats() {
        return ResponseEntity.ok(directoryService.getStats());
    }
}

