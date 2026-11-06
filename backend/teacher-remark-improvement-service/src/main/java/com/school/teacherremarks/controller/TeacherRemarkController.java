package com.school.teacherremarks.controller;

import com.school.teacherremarks.dto.AcknowledgeRemarkRequest;
import com.school.teacherremarks.dto.CreateRemarkRequest;
import com.school.teacherremarks.dto.RemarkDetailDto;
import com.school.teacherremarks.dto.StudentOptionDto;
import com.school.teacherremarks.entity.RemarkAcknowledgment;
import com.school.teacherremarks.entity.TeacherStudentRemark;
import com.school.teacherremarks.service.TeacherRemarkService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/teacher-remarks")
@CrossOrigin(origins = "*")
public class TeacherRemarkController {

    @Autowired
    private TeacherRemarkService remarkService;

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> status = new HashMap<>();
        status.put("service", "TEACHER-REMARK-IMPROVEMENT-SERVICE");
        status.put("port", 8106);
        status.put("status", "UP");
        status.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(status);
    }

    /**
     * Teacher / Staff: Get remarks dispatched by teacher
     */
    @GetMapping("/teacher")
    public ResponseEntity<List<TeacherStudentRemark>> getRemarksByTeacher(
            @RequestParam(value = "username", required = false, defaultValue = "teacher") String username) {
        List<TeacherStudentRemark> remarks = remarkService.getRemarksByTeacher(username);
        return ResponseEntity.ok(remarks);
    }

    /**
     * Parent: Get remarks specifically for their child(ren)
     */
    @GetMapping("/parent")
    public ResponseEntity<List<TeacherStudentRemark>> getRemarksForParent(
            @RequestParam(value = "username", required = false) String username,
            @RequestParam(value = "studentId", required = false) String studentId) {
        List<TeacherStudentRemark> remarks = remarkService.getRemarksForParent(username, studentId);
        return ResponseEntity.ok(remarks);
    }

    /**
     * Get single remark with full acknowledgment history
     */
    @GetMapping("/{id}")
    public ResponseEntity<RemarkDetailDto> getRemarkById(@PathVariable("id") Long id) {
        RemarkDetailDto detail = remarkService.getRemarkById(id);
        return ResponseEntity.ok(detail);
    }

    /**
     * Teacher / Staff: Create student academic improvement remark
     */
    @PostMapping("/create")
    public ResponseEntity<TeacherStudentRemark> createRemark(@Valid @RequestBody CreateRemarkRequest request) {
        TeacherStudentRemark saved = remarkService.createRemark(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    /**
     * Teacher / Staff: Remove/delete their feedback
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteRemark(
            @PathVariable("id") Long id,
            @RequestParam(value = "username", required = false) String username) {
        remarkService.deleteRemark(id, username);
        Map<String, Object> resp = new HashMap<>();
        resp.put("deleted", true);
        resp.put("id", id);
        resp.put("message", "Remark feedback successfully removed.");
        return ResponseEntity.ok(resp);
    }

    /**
     * Parent: Acknowledge remark with exact date, time, and optional notes
     */
    @PostMapping("/{id}/acknowledge")
    public ResponseEntity<RemarkDetailDto> acknowledgeRemark(
            @PathVariable("id") Long id,
            @Valid @RequestBody AcknowledgeRemarkRequest request) {
        RemarkDetailDto updated = remarkService.acknowledgeRemark(id, request);
        return ResponseEntity.ok(updated);
    }

    /**
     * Dropdown roster helper for teachers
     */
    @GetMapping("/students")
    public ResponseEntity<List<StudentOptionDto>> getAvailableStudents() {
        return ResponseEntity.ok(remarkService.getAvailableStudents());
    }
}

