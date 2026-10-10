package com.school.examination.controller;

import com.school.examination.entity.AssignmentQuestion;
import com.school.examination.entity.StudentAssignment;
import com.school.examination.repository.StudentAssignmentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/staff-examination")
public class StaffExaminationController {

    private final StudentAssignmentRepository assignmentRepository;

    public StaffExaminationController(StudentAssignmentRepository assignmentRepository) {
        this.assignmentRepository = assignmentRepository;
    }

    @PostMapping(value = {"/assignment/save", "/assignments", "/assignment"})
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

    @RequestMapping(value = "/assignments/{id}/release-results", method = {RequestMethod.PUT, RequestMethod.POST})
    public ResponseEntity<?> releaseResults(@PathVariable Long id, @RequestParam Boolean released) {
        Optional<StudentAssignment> opt = assignmentRepository.findById(id);
        if (opt.isPresent()) {
            StudentAssignment asm = opt.get();
            asm.setResultsReleased(released);
            StudentAssignment saved = assignmentRepository.save(asm);
            return ResponseEntity.ok(Map.of(
                "message", "Results release status updated successfully",
                "assignmentId", saved.getId(),
                "resultsReleased", saved.getResultsReleased()
            ));
        }
        return ResponseEntity.notFound().build();
    }

    @RequestMapping(value = {"/assignments/{id}", "/assignments/{id}/delete"}, method = {RequestMethod.DELETE, RequestMethod.POST})
    public ResponseEntity<?> deleteAssignment(@PathVariable Long id) {
        if (assignmentRepository.existsById(id)) {
            assignmentRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Assignment deleted successfully", "id", id));
        }
        return ResponseEntity.notFound().build();
    }
}
