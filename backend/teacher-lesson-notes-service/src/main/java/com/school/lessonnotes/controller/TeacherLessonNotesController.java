package com.school.lessonnotes.controller;

import com.school.lessonnotes.dto.LessonNoteRequestDto;
import com.school.lessonnotes.entity.TeacherLessonNote;
import com.school.lessonnotes.repository.TeacherLessonNoteRepository;
import com.school.lessonnotes.security.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "*"}, allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.PATCH, RequestMethod.OPTIONS})
@RestController
@RequestMapping("/api/teacher-lesson-notes")
public class TeacherLessonNotesController {

    private final TeacherLessonNoteRepository repository;
    private final JwtUtil jwtUtil;

    public TeacherLessonNotesController(TeacherLessonNoteRepository repository, JwtUtil jwtUtil) {
        this.repository = repository;
        this.jwtUtil = jwtUtil;
    }

    /**
     * Send / Publish lesson notes for a specific class, section, and subject.
     * Extracts and validates the teacher's identity from JWT or request payload.
     */
    @PostMapping(value = {"/send", "/notes", ""})
    public ResponseEntity<?> sendLessonNotes(
            @Valid @RequestBody LessonNoteRequestDto request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        String token = jwtUtil.resolveToken(authHeader);
        Map<String, Object> claims = null;
        if (token != null) {
            claims = jwtUtil.parseClaims(token);
        }

        // Determine teacher name: Priority to JWT claims, then request body, then fallback
        String resolvedTeacherName = jwtUtil.extractTeacherName(claims, request.getTeacherName());
        if (resolvedTeacherName == null || resolvedTeacherName.trim().isEmpty()) {
            resolvedTeacherName = "Faculty Teacher";
        }

        String resolvedUsername = claims != null ? jwtUtil.extractUsername(claims) : request.getTeacherUsername();
        String resolvedEmail = claims != null ? jwtUtil.extractEmail(claims) : request.getTeacherEmail();

        TeacherLessonNote note = new TeacherLessonNote(
                resolvedTeacherName.trim(),
                request.getClassName().trim(),
                request.getSection().trim(),
                request.getSubject().trim(),
                request.getTopic() != null ? request.getTopic().trim() : "General Lesson Notes",
                request.getNotesContent().trim(),
                LocalDateTime.now(),
                resolvedUsername,
                resolvedEmail
        );

        TeacherLessonNote savedNote = repository.save(note);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Lesson notes successfully dispatched to " + request.getClassName() + " Section " + request.getSection());
        response.put("success", true);
        response.put("jwtVerified", claims != null);
        response.put("note", savedNote);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get notes history sent by a specific teacher or filtered by class, section, or subject.
     */
    @GetMapping(value = {"/history", "/my-notes"})
    public ResponseEntity<?> getTeacherNotesHistory(
            @RequestParam(required = false) String teacherName,
            @RequestParam(required = false) String className,
            @RequestParam(required = false) String section,
            @RequestParam(required = false) String subject,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        String token = jwtUtil.resolveToken(authHeader);
        Map<String, Object> claims = null;
        if (token != null) {
            claims = jwtUtil.parseClaims(token);
        }

        String targetTeacher = teacherName;
        if ((targetTeacher == null || targetTeacher.trim().isEmpty()) && claims != null) {
            targetTeacher = jwtUtil.extractTeacherName(claims, null);
        }

        List<TeacherLessonNote> history;
        if (targetTeacher != null && !targetTeacher.trim().isEmpty()) {
            if (className != null || section != null || subject != null) {
                history = repository.findNotesWithFilters(targetTeacher.trim(), className, section, subject);
            } else {
                history = repository.findByTeacherNameIgnoreCaseOrderByTimeOfNotesCreatedDesc(targetTeacher.trim());
            }
        } else if (className != null || section != null || subject != null) {
            history = repository.findNotesWithFilters(null, className, section, subject);
        } else {
            history = repository.findAllByOrderByTimeOfNotesCreatedDesc();
        }

        return ResponseEntity.ok(Map.of(
                "teacherName", targetTeacher != null ? targetTeacher : "All Teachers",
                "count", history.size(),
                "history", history,
                "jwtVerified", claims != null
        ));
    }

    /**
     * Get all notes (for broad view or student portals)
     */
    @GetMapping(value = {"/all", ""})
    public ResponseEntity<?> getAllNotes() {
        List<TeacherLessonNote> all = repository.findAllByOrderByTimeOfNotesCreatedDesc();
        return ResponseEntity.ok(Map.of(
                "totalCount", all.size(),
                "notes", all
        ));
    }

    /**
     * Get single note by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getNoteById(@PathVariable Long id) {
        Optional<TeacherLessonNote> noteOpt = repository.findById(id);
        if (noteOpt.isPresent()) {
            return ResponseEntity.ok(noteOpt.get());
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Lesson note not found with ID " + id));
    }

    /**
     * Delete note by ID
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNote(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (!repository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Lesson note not found"));
        }

        repository.deleteById(id);
        return ResponseEntity.ok(Map.of(
                "message", "Lesson note deleted successfully",
                "id", id,
                "success", true
        ));
    }

    /**
     * JWT Diagnostic endpoint to check token health & extracted claims
     */
    @GetMapping("/jwt-check")
    public ResponseEntity<?> checkJwtToken(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        String token = jwtUtil.resolveToken(authHeader);
        if (token == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "valid", false,
                    "message", "No Authorization token provided in request header"
            ));
        }

        Map<String, Object> claims = jwtUtil.parseClaims(token);
        if (claims == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "valid", false,
                    "message", "Invalid or malformed JWT token"
            ));
        }

        return ResponseEntity.ok(Map.of(
                "valid", true,
                "teacherName", jwtUtil.extractTeacherName(claims, "Unknown"),
                "username", jwtUtil.extractUsername(claims),
                "role", jwtUtil.extractRole(claims),
                "email", jwtUtil.extractEmail(claims),
                "claims", claims
        ));
    }
}
