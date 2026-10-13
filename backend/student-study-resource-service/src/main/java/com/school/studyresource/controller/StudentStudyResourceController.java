package com.school.studyresource.controller;

import com.school.studyresource.entity.StudentDetails;
import com.school.studyresource.entity.TeacherLessonNote;
import com.school.studyresource.repository.StudentDetailsRepository;
import com.school.studyresource.repository.StudyResourceNoteRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "*"}, allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.PATCH, RequestMethod.OPTIONS})
@RestController
@RequestMapping("/api/student-study-resource")
public class StudentStudyResourceController {

    private final StudyResourceNoteRepository noteRepository;
    private final StudentDetailsRepository studentRepository;

    public StudentStudyResourceController(StudyResourceNoteRepository noteRepository,
                                          StudentDetailsRepository studentRepository) {
        this.noteRepository = noteRepository;
        this.studentRepository = studentRepository;
    }

    /**
     * Get study resource notes sent by teachers.
     * Filterable by student username/cohort, class, section, subject, teacher name, and search term.
     */
    @GetMapping(value = {"/notes", ""})
    public ResponseEntity<?> getStudyNotes(
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String className,
            @RequestParam(required = false) String section,
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) String teacherName,
            @RequestParam(required = false) String search) {

        String resolvedClass = className;
        String resolvedSection = section;

        // Auto-resolve cohort from student_details if username provided and no explicit class
        if (username != null && !username.trim().isEmpty() && (resolvedClass == null || resolvedClass.trim().isEmpty())) {
            Optional<StudentDetails> optStudent = studentRepository.findByFirstNameIgnoreCase(username.trim());
            if (optStudent.isEmpty() && username.contains("@")) {
                optStudent = studentRepository.findByFirstNameIgnoreCase(username.split("@")[0]);
            }
            if (optStudent.isPresent()) {
                StudentDetails sd = optStudent.get();
                resolvedClass = String.valueOf(sd.getClassStandard());
                if (resolvedSection == null || resolvedSection.trim().isEmpty()) {
                    resolvedSection = sd.getSectionName();
                }
            }
        }

        // Clean up class pattern (e.g., "Class 10" -> "10" or "Class 10")
        String classPattern = null;
        if (resolvedClass != null && !resolvedClass.trim().isEmpty() && !resolvedClass.equalsIgnoreCase("ALL")) {
            classPattern = resolvedClass.trim();
            if (classPattern.toLowerCase().startsWith("class ")) {
                classPattern = classPattern.substring(6).trim();
            } else if (classPattern.toLowerCase().startsWith("grade ")) {
                classPattern = classPattern.substring(6).trim();
            }
        }

        String secFilter = (resolvedSection != null && !resolvedSection.equalsIgnoreCase("ALL") && !resolvedSection.trim().isEmpty())
                ? resolvedSection.trim()
                : null;
        String subjFilter = (subject != null && !subject.equalsIgnoreCase("ALL") && !subject.trim().isEmpty())
                ? subject.trim()
                : null;
        String teacherFilter = (teacherName != null && !teacherName.equalsIgnoreCase("ALL") && !teacherName.trim().isEmpty())
                ? teacherName.trim()
                : null;
        String searchFilter = (search != null && !search.trim().isEmpty()) ? search.trim() : null;

        List<TeacherLessonNote> notes = noteRepository.findStudentNotes(
                classPattern,
                secFilter,
                subjFilter,
                teacherFilter,
                searchFilter
        );

        // If specific section has no notes yet, fallback to class-wide notes
        if (notes.isEmpty() && secFilter != null && classPattern != null) {
            notes = noteRepository.findStudentNotes(
                    classPattern,
                    null,
                    subjFilter,
                    teacherFilter,
                    searchFilter
            );
        }

        // If still empty and filters are loose, provide all latest notes as fallback
        if (notes.isEmpty() && classPattern == null && secFilter == null && subjFilter == null && teacherFilter == null) {
            notes = noteRepository.findAllByOrderByTimeOfNotesCreatedDesc();
        }

        Map<String, Object> response = new HashMap<>();
        response.put("count", notes.size());
        response.put("notes", notes);
        response.put("studentCohort", Map.of(
                "resolvedClass", resolvedClass != null ? resolvedClass : "All",
                "resolvedSection", resolvedSection != null ? resolvedSection : "All",
                "classPattern", classPattern != null ? classPattern : "None"
        ));

        return ResponseEntity.ok(response);
    }

    /**
     * Get specific note by ID
     */
    @GetMapping("/notes/{id}")
    public ResponseEntity<?> getNoteById(@PathVariable Long id) {
        Optional<TeacherLessonNote> noteOpt = noteRepository.findById(id);
        if (noteOpt.isPresent()) {
            return ResponseEntity.ok(noteOpt.get());
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Study note not found"));
    }

    /**
     * Get distinct subjects available for class/section
     */
    @GetMapping("/subjects")
    public ResponseEntity<?> getSubjects(
            @RequestParam(required = false) String className,
            @RequestParam(required = false) String section) {

        String classPattern = className;
        if (classPattern != null && classPattern.toLowerCase().startsWith("class ")) {
            classPattern = classPattern.substring(6).trim();
        }

        List<String> subjects = noteRepository.findDistinctSubjects(classPattern, section);
        if (subjects.isEmpty()) {
            subjects = List.of("Mathematics", "Science", "Physics", "Chemistry", "Biology", "English", "Social Science");
        }
        return ResponseEntity.ok(subjects);
    }

    /**
     * Get distinct teachers who sent notes
     */
    @GetMapping("/teachers")
    public ResponseEntity<?> getTeachers(
            @RequestParam(required = false) String className,
            @RequestParam(required = false) String section) {

        String classPattern = className;
        if (classPattern != null && classPattern.toLowerCase().startsWith("class ")) {
            classPattern = classPattern.substring(6).trim();
        }

        List<String> teachers = noteRepository.findDistinctTeachers(classPattern, section);
        return ResponseEntity.ok(teachers);
    }

    /**
     * Resolve student cohort from username
     */
    @GetMapping("/cohort")
    public ResponseEntity<?> getStudentCohort(@RequestParam String username) {
        Optional<StudentDetails> opt = studentRepository.findByFirstNameIgnoreCase(username);
        if (opt.isPresent()) {
            StudentDetails s = opt.get();
            return ResponseEntity.ok(Map.of(
                    "found", true,
                    "studentId", s.getStudentId(),
                    "classStandard", s.getClassStandard(),
                    "className", "Class " + s.getClassStandard(),
                    "sectionName", s.getSectionName(),
                    "fullName", s.getFirstName() + " " + s.getLastName()
            ));
        }
        return ResponseEntity.ok(Map.of(
                "found", false,
                "classStandard", 10,
                "className", "Class 10",
                "sectionName", "A"
        ));
    }
}
