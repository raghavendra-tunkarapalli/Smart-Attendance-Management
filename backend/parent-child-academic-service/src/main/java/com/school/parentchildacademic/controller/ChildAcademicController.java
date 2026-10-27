package com.school.parentchildacademic.controller;

import com.school.parentchildacademic.dto.*;
import com.school.parentchildacademic.entity.ParentChildRelationship;
import com.school.parentchildacademic.service.ChildAcademicService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/parent-child-academic")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class ChildAcademicController {

    private final ChildAcademicService academicService;

    public ChildAcademicController(ChildAcademicService academicService) {
        this.academicService = academicService;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> resp = new HashMap<>();
        resp.put("status", "UP");
        resp.put("service", "parent-child-academic-service");
        resp.put("message", "Child Academic microservice is operational");
        return ResponseEntity.ok(resp);
    }

    /**
     * Get all children linked to parent.
     */
    @GetMapping("/children/{parentUserId}")
    public ResponseEntity<List<ParentChildRelationship>> getChildren(@PathVariable Long parentUserId) {
        List<ParentChildRelationship> list = academicService.getChildrenForParent(parentUserId);
        return ResponseEntity.ok(list);
    }

    /**
     * Get attendance statistics for child.
     */
    @GetMapping("/attendance")
    public ResponseEntity<ChildAttendanceStatsDto> getAttendance(
            @RequestParam(required = false) String studentId,
            @RequestParam(required = false) String username) {
        ChildAttendanceStatsDto stats = academicService.getChildAttendance(studentId, username);
        return ResponseEntity.ok(stats);
    }

    /**
     * Get examinations and evaluated marks for child.
     */
    @GetMapping("/exams")
    public ResponseEntity<List<ChildExamDto>> getExams(
            @RequestParam String username,
            @RequestParam(required = false) Integer classStandard,
            @RequestParam(required = false) String sectionName) {
        List<ChildExamDto> exams = academicService.getChildExams(username, classStandard, sectionName);
        return ResponseEntity.ok(exams);
    }

    /**
     * Get full question review and official answer key sheet for an exam.
     */
    @GetMapping("/review/{assignmentId}")
    public ResponseEntity<ChildExamKeySheetDto> getReview(
            @PathVariable Long assignmentId,
            @RequestParam(required = false, defaultValue = "student1") String username) {
        ChildExamKeySheetDto keySheet = academicService.getExamKeySheet(assignmentId, username);
        return ResponseEntity.ok(keySheet);
    }
}
