package com.school.staffadmindirectory.controller;

import com.school.staffadmindirectory.dto.AcknowledgeDirectionRequest;
import com.school.staffadmindirectory.dto.StaffDirectionDto;
import com.school.staffadmindirectory.dto.StaffDirectorySummaryDto;
import com.school.staffadmindirectory.service.StaffAdminDirectoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/staff-admin-directory")
public class StaffAdminDirectoryController {

    private final StaffAdminDirectoryService service;

    public StaffAdminDirectoryController(StaffAdminDirectoryService service) {
        this.service = service;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "staff-admin-directory-service",
                "port", "8109"
        ));
    }

    @GetMapping("/directions")
    public ResponseEntity<List<StaffDirectionDto>> getDirections(
            @RequestParam(required = false, defaultValue = "staff") String username,
            @RequestParam(required = false, defaultValue = "ALL") String filter,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(service.getDirectionsForStaff(username, filter, search));
    }

    @GetMapping("/directions/{id}")
    public ResponseEntity<StaffDirectionDto> getDirectionById(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "staff") String username) {
        return service.getDirectionById(id, username)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/directions/{id}/acknowledge")
    public ResponseEntity<?> acknowledgeDirection(
            @PathVariable Long id,
            @RequestBody AcknowledgeDirectionRequest request) {
        return service.acknowledgeDirection(id, request)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/directions/{id}/toggle-seen")
    public ResponseEntity<?> toggleSeen(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String username = body != null ? body.get("staffUsername") : "staff";
        String staffName = body != null ? body.get("staffName") : "Michael Scott";
        return service.toggleSeen(id, username, staffName)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/summary")
    public ResponseEntity<StaffDirectorySummaryDto> getSummary(
            @RequestParam(required = false, defaultValue = "staff") String username) {
        return ResponseEntity.ok(service.getSummaryStats(username));
    }
}

