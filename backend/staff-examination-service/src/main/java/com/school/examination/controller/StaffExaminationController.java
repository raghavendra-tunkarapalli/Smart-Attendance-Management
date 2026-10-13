package com.school.examination.controller;

import com.school.examination.entity.AssignmentQuestion;
import com.school.examination.entity.StudentAssignment;
import com.school.examination.repository.AssignmentQuestionRepository;
import com.school.examination.repository.StudentAssignmentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "*"}, allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.PATCH, RequestMethod.OPTIONS})
@RestController
@RequestMapping("/api/staff-examination")
public class StaffExaminationController {

    private final StudentAssignmentRepository assignmentRepository;
    private final AssignmentQuestionRepository questionRepository;

    public StaffExaminationController(StudentAssignmentRepository assignmentRepository,
                                     AssignmentQuestionRepository questionRepository) {
        this.assignmentRepository = assignmentRepository;
        this.questionRepository = questionRepository;
    }

    @PostMapping(value = {"/assignment/save", "/assignments", "/assignment"})
    @Transactional
    public ResponseEntity<?> saveAssignment(@RequestBody StudentAssignment assignment) {
        if (assignment.getAssignmentTitle() == null || assignment.getAssignmentTitle().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Assignment title cannot be empty");
        }
        if (assignment.getClassStandard() == null || assignment.getSectionName() == null) {
            return ResponseEntity.badRequest().body("Class Standard and Section Name are required");
        }

        // Establish bi-directional references
        if (assignment.getQuestions() != null) {
            for (AssignmentQuestion question : assignment.getQuestions()) {
                question.setAssignment(assignment);
            }
        }

        StudentAssignment saved = assignmentRepository.save(assignment);
        return ResponseEntity.ok(Map.of(
            "message", "Assignment saved successfully",
            "id", saved.getId(),
            "assignmentId", saved.getId(),
            "questionsCount", saved.getQuestions() != null ? saved.getQuestions().size() : 0
        ));
    }

    @GetMapping("/assignments")
    public ResponseEntity<List<StudentAssignment>> getAssignments(
            @RequestParam(required = false) Integer classStandard,
            @RequestParam(required = false) String sectionName) {
        
        List<StudentAssignment> list;
        if (classStandard != null && sectionName != null && !sectionName.trim().isEmpty() && !sectionName.equalsIgnoreCase("ALL")) {
            list = assignmentRepository.findByClassStandardAndSectionNameOrderByCreatedAtDesc(
                    classStandard, sectionName.toUpperCase());
        } else if (classStandard != null) {
            list = assignmentRepository.findByClassStandardOrderByCreatedAtDesc(classStandard);
        } else {
            list = assignmentRepository.findAllByOrderByCreatedAtDesc();
        }
        return ResponseEntity.ok(list);
    }

    @GetMapping("/assignments/all")
    public ResponseEntity<List<StudentAssignment>> getAllAssignments() {
        return ResponseEntity.ok(assignmentRepository.findAllByOrderByCreatedAtDesc());
    }

    @GetMapping("/assignments/{id}")
    public ResponseEntity<?> getAssignmentById(@PathVariable Long id) {
        Optional<StudentAssignment> opt = assignmentRepository.findById(id);
        if (opt.isPresent()) {
            StudentAssignment assignment = opt.get();
            if (assignment.getQuestions() != null) {
                assignment.getQuestions().sort(Comparator.comparing(AssignmentQuestion::getQuestionNumber));
            }
            return ResponseEntity.ok(assignment);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/assignments/{id}/questions")
    public ResponseEntity<List<AssignmentQuestion>> getAssignmentQuestions(@PathVariable Long id) {
        Optional<StudentAssignment> opt = assignmentRepository.findById(id);
        if (opt.isPresent()) {
            List<AssignmentQuestion> questions = opt.get().getQuestions();
            // Sort by question number
            questions.sort(Comparator.comparing(AssignmentQuestion::getQuestionNumber));
            return ResponseEntity.ok(questions);
        }
        return ResponseEntity.notFound().build();
    }

    @RequestMapping(value = {
        "/assignments/{id}/release-results",
        "/assignments/{id}/toggle-status",
        "/assignments/{id}/unpublish",
        "/assignments/{id}/publish"
    }, method = {RequestMethod.PUT, RequestMethod.POST, RequestMethod.PATCH, RequestMethod.GET})
    @Transactional
    public ResponseEntity<?> releaseResults(
            @PathVariable Long id,
            @RequestParam(required = false) Boolean released,
            @RequestBody(required = false) Map<String, Object> body,
            jakarta.servlet.http.HttpServletRequest request) {
        Optional<StudentAssignment> opt = assignmentRepository.findById(id);
        if (opt.isPresent()) {
            StudentAssignment asm = opt.get();
            String uri = request != null ? request.getRequestURI() : "";
            Boolean newStatus = released;

            // Direct route hints
            if (uri.endsWith("/unpublish")) {
                newStatus = false;
            } else if (uri.endsWith("/publish")) {
                newStatus = true;
            }

            // Body fallback
            if (newStatus == null && body != null && body.containsKey("released")) {
                Object val = body.get("released");
                if (val instanceof Boolean) {
                    newStatus = (Boolean) val;
                } else if (val != null) {
                    newStatus = Boolean.parseBoolean(val.toString());
                }
            }

            // Auto toggle if not explicitly specified
            if (newStatus == null) {
                newStatus = asm.getResultsReleased() == null || !asm.getResultsReleased();
            }

            asm.setResultsReleased(newStatus);
            StudentAssignment saved = assignmentRepository.save(asm);
            return ResponseEntity.ok(Map.of(
                "message", newStatus ? "Exam published successfully" : "Exam unpublished successfully (Draft mode)",
                "assignmentId", saved.getId(),
                "id", saved.getId(),
                "resultsReleased", saved.getResultsReleased()
            ));
        }
        return ResponseEntity.notFound().build();
    }

    @RequestMapping(value = {
        "/assignments/{id}",
        "/assignments/{id}/delete"
    }, method = {RequestMethod.DELETE, RequestMethod.POST, RequestMethod.GET})
    @Transactional
    public ResponseEntity<?> deleteAssignment(@PathVariable Long id) {
        Optional<StudentAssignment> opt = assignmentRepository.findById(id);
        if (opt.isPresent()) {
            StudentAssignment asm = opt.get();
            // Remove associated questions first to ensure clean FK cascade
            if (asm.getQuestions() != null && !asm.getQuestions().isEmpty()) {
                questionRepository.deleteAll(asm.getQuestions());
                asm.getQuestions().clear();
            }
            assignmentRepository.delete(asm);
            return ResponseEntity.ok(Map.of(
                "message", "Examination deleted successfully",
                "id", id,
                "success", true
            ));
        }
        return ResponseEntity.notFound().build();
    }
}
