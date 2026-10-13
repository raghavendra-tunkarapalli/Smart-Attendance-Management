package com.school.studentexamination.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.school.studentexamination.dto.*;
import com.school.studentexamination.entity.AssignmentQuestion;
import com.school.studentexamination.entity.StudentAssignment;
import com.school.studentexamination.entity.StudentDetailsEntity;
import com.school.studentexamination.entity.StudentExamSubmission;
import com.school.studentexamination.repository.AssignmentQuestionRepository;
import com.school.studentexamination.repository.StudentAssignmentRepository;
import com.school.studentexamination.repository.StudentDetailsRepository;
import com.school.studentexamination.repository.StudentExamSubmissionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/student-examination")
@CrossOrigin(origins = "*")
public class StudentExaminationController {

    private final StudentAssignmentRepository assignmentRepository;
    private final AssignmentQuestionRepository questionRepository;
    private final StudentExamSubmissionRepository submissionRepository;
    private final StudentDetailsRepository studentDetailsRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public StudentExaminationController(
            StudentAssignmentRepository assignmentRepository,
            AssignmentQuestionRepository questionRepository,
            StudentExamSubmissionRepository submissionRepository,
            StudentDetailsRepository studentDetailsRepository) {
        this.assignmentRepository = assignmentRepository;
        this.questionRepository = questionRepository;
        this.submissionRepository = submissionRepository;
        this.studentDetailsRepository = studentDetailsRepository;
    }

    /**
     * Resolve student's cohort (class and section).
     */
    @GetMapping("/student-cohort")
    public ResponseEntity<StudentCohortResponse> getStudentCohort(
            @RequestParam String username,
            @RequestParam(required = false) Integer classStandard,
            @RequestParam(required = false) String sectionName) {
        StudentCohortResponse cohort = resolveCohort(username, classStandard, sectionName);
        return ResponseEntity.ok(cohort);
    }

    /**
     * Get available exams for the student's specific class and section.
     * E.g., Class 10 Section A students only get exams assigned to Class 10 Section A.
     */
    @GetMapping("/available-exams")
    public ResponseEntity<List<AvailableExamResponse>> getAvailableExams(
            @RequestParam String username,
            @RequestParam(required = false) Integer classStandard,
            @RequestParam(required = false) String sectionName) {

        StudentCohortResponse cohort = resolveCohort(username, classStandard, sectionName);
        List<StudentAssignment> assignments = assignmentRepository.findByClassStandardAndSectionName(
                cohort.getClassStandard(), cohort.getSectionName());

        List<AvailableExamResponse> result = new ArrayList<>();
        for (StudentAssignment sa : assignments) {
            AvailableExamResponse resp = new AvailableExamResponse();
            resp.setId(sa.getId());
            resp.setAssignmentTitle(sa.getAssignmentTitle());
            resp.setSubject(sa.getSubject());
            resp.setClassStandard(sa.getClassStandard());
            resp.setSectionName(sa.getSectionName());
            resp.setConductDate(sa.getConductDate());
            resp.setTotalQuestions(sa.getQuestions() != null ? sa.getQuestions().size() : 0);
            resp.setResultsReleased(Boolean.TRUE.equals(sa.getResultsReleased()));

            // Check if this student has submitted
            Optional<StudentExamSubmission> subOpt = submissionRepository.findByStudentUsernameAndAssignmentId(username, sa.getId());
            if (subOpt.isPresent()) {
                StudentExamSubmission sub = subOpt.get();
                resp.setHasAttempted(true);
                resp.setAttemptStatus(sub.getStatus());
                if (Boolean.TRUE.equals(sa.getResultsReleased())) {
                    resp.setScore(sub.getScore());
                    resp.setTotalMarks(sub.getTotalMarks());
                    resp.setPercentage(sub.getPercentage());
                }
            } else {
                resp.setHasAttempted(false);
                resp.setAttemptStatus("PENDING_ATTEMPT");
            }
            result.add(resp);
        }

        return ResponseEntity.ok(result);
    }

    /**
     * Fetch exam question paper for student to attempt.
     * Correct options are intentionally stripped for exam security.
     */
    @GetMapping("/exam-paper/{assignmentId}")
    public ResponseEntity<?> getExamPaper(
            @PathVariable Long assignmentId,
            @RequestParam String username) {

        Optional<StudentAssignment> assignOpt = assignmentRepository.findById(assignmentId);
        if (assignOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        StudentAssignment sa = assignOpt.get();

        // Check if student has already attempted
        boolean alreadyAttempted = submissionRepository.existsByStudentUsernameAndAssignmentId(username, assignmentId);

        ExamPaperResponse paper = new ExamPaperResponse();
        paper.setAssignmentId(sa.getId());
        paper.setAssignmentTitle(sa.getAssignmentTitle());
        paper.setSubject(sa.getSubject());
        paper.setClassStandard(sa.getClassStandard());
        paper.setSectionName(sa.getSectionName());
        paper.setConductDate(sa.getConductDate());
        paper.setTotalQuestions(sa.getQuestions() != null ? sa.getQuestions().size() : 0);
        paper.setAlreadyAttempted(alreadyAttempted);

        if (!alreadyAttempted) {
            List<ExamQuestionDto> qList = new ArrayList<>();
            if (sa.getQuestions() != null) {
                for (AssignmentQuestion q : sa.getQuestions()) {
                    ExamQuestionDto qDto = new ExamQuestionDto();
                    qDto.setId(q.getId());
                    qDto.setQuestionNumber(q.getQuestionNumber());
                    qDto.setQuestionText(q.getQuestionText());
                    qDto.setOptionA(q.getOptionA());
                    qDto.setOptionB(q.getOptionB());
                    qDto.setOptionC(q.getOptionC());
                    qDto.setOptionD(q.getOptionD());
                    // Hide correctOption!
                    qDto.setCorrectOption(null);
                    qList.add(qDto);
                }
            }
            qList.sort(Comparator.comparing(ExamQuestionDto::getQuestionNumber));
            paper.setQuestions(qList);
        }

        return ResponseEntity.ok(paper);
    }

    /**
     * Submit an exam attempt.
     * Evaluates answers immediately and saves submission record.
     */
    @PostMapping("/submit-exam")
    public ResponseEntity<?> submitExam(@RequestBody ExamSubmitRequest request) {
        if (request.getAssignmentId() == null || request.getStudentUsername() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "assignmentId and studentUsername are required"));
        }

        Optional<StudentAssignment> assignOpt = assignmentRepository.findById(request.getAssignmentId());
        if (assignOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        StudentAssignment sa = assignOpt.get();

        // Check for duplicate submission
        if (submissionRepository.existsByStudentUsernameAndAssignmentId(
                request.getStudentUsername(), request.getAssignmentId())) {
            return ResponseEntity.badRequest().body(Map.of("error", "You have already attempted and submitted this exam."));
        }

        List<AssignmentQuestion> questions = sa.getQuestions() != null ? sa.getQuestions() : Collections.emptyList();
        int totalQuestions = questions.size();
        int attemptedCount = 0;
        int correctCount = 0;

        Map<String, String> answers = request.getAnswers() != null ? request.getAnswers() : Collections.emptyMap();

        for (AssignmentQuestion q : questions) {
            String qNumKey = String.valueOf(q.getQuestionNumber());
            String studentChoice = answers.get(qNumKey);
            if (studentChoice == null && q.getId() != null) {
                studentChoice = answers.get(String.valueOf(q.getId()));
            }

            if (studentChoice != null && !studentChoice.trim().isEmpty()) {
                attemptedCount++;
                String expected = q.getCorrectOption();
                if (expected != null && expected.trim().equalsIgnoreCase(studentChoice.trim())) {
                    correctCount++;
                }
            }
        }

        double score = (double) correctCount;
        double totalMarks = (double) (totalQuestions > 0 ? totalQuestions : 10);
        double percentage = totalQuestions > 0 ? ((score / totalMarks) * 100.0) : 0.0;
        percentage = Math.round(percentage * 10.0) / 10.0;

        StudentCohortResponse cohort = resolveCohort(request.getStudentUsername(), sa.getClassStandard(), sa.getSectionName());

        StudentExamSubmission sub = new StudentExamSubmission();
        sub.setStudentUsername(request.getStudentUsername());
        sub.setStudentName(request.getStudentName() != null && !request.getStudentName().isBlank()
                ? request.getStudentName() : cohort.getStudentName());
        sub.setAssignmentId(sa.getId());
        sub.setAssignmentTitle(sa.getAssignmentTitle());
        sub.setSubject(sa.getSubject());
        sub.setClassStandard(sa.getClassStandard());
        sub.setSectionName(sa.getSectionName());
        sub.setConductDate(sa.getConductDate());
        sub.setTotalQuestions(totalQuestions);
        sub.setAttemptedQuestions(attemptedCount);
        sub.setCorrectAnswers(correctCount);
        sub.setScore(score);
        sub.setTotalMarks(totalMarks);
        sub.setPercentage(percentage);
        sub.setStatus("ATTEMPTED");
        sub.setRemarks("Examination submitted successfully");
        sub.setSubmittedAt(LocalDateTime.now());

        try {
            sub.setStudentAnswers(objectMapper.writeValueAsString(answers));
        } catch (Exception e) {
            sub.setStudentAnswers("{}");
        }

        StudentExamSubmission saved = submissionRepository.save(sub);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Exam submitted successfully! Results will be released once published by staff.");
        response.put("submissionId", saved.getId());
        response.put("assignmentTitle", sa.getAssignmentTitle());
        response.put("subject", sa.getSubject());
        response.put("totalQuestions", totalQuestions);
        response.put("attemptedQuestions", attemptedCount);
        response.put("score", score);
        response.put("totalMarks", totalMarks);
        response.put("percentage", percentage);
        response.put("resultsReleased", Boolean.TRUE.equals(sa.getResultsReleased()));

        return ResponseEntity.ok(response);
    }

    /**
     * Get exam results for the student.
     * Requirements:
     * 1. Only self results for the given student username.
     * 2. Shows published exams (resultsReleased == true).
     * 3. If a student did NOT attend the exam, automatically assigns 0 marks and records
     *    in student_exam_submissions so it permanently remains in their history.
     */
    @GetMapping("/results")
    public ResponseEntity<List<ExamResultResponse>> getStudentResults(
            @RequestParam String username,
            @RequestParam(required = false) Integer classStandard,
            @RequestParam(required = false) String sectionName) {

        StudentCohortResponse cohort = resolveCohort(username, classStandard, sectionName);

        // Fetch all assignments for this student's cohort where results have been published
        List<StudentAssignment> publishedAssignments = assignmentRepository.findByClassStandardAndSectionNameAndResultsReleased(
                cohort.getClassStandard(), cohort.getSectionName(), true);

        // For any published exam where this student has no submission, record 0 marks permanently
        for (StudentAssignment sa : publishedAssignments) {
            Optional<StudentExamSubmission> existing = submissionRepository.findByStudentUsernameAndAssignmentId(username, sa.getId());
            if (existing.isEmpty()) {
                int totalQ = sa.getQuestions() != null ? sa.getQuestions().size() : 0;
                StudentExamSubmission unattempted = new StudentExamSubmission();
                unattempted.setStudentUsername(username);
                unattempted.setStudentName(cohort.getStudentName());
                unattempted.setAssignmentId(sa.getId());
                unattempted.setAssignmentTitle(sa.getAssignmentTitle());
                unattempted.setSubject(sa.getSubject());
                unattempted.setClassStandard(sa.getClassStandard());
                unattempted.setSectionName(sa.getSectionName());
                unattempted.setConductDate(sa.getConductDate());
                unattempted.setTotalQuestions(totalQ);
                unattempted.setAttemptedQuestions(0);
                unattempted.setCorrectAnswers(0);
                unattempted.setScore(0.0);
                unattempted.setTotalMarks((double) (totalQ > 0 ? totalQ : 10));
                unattempted.setPercentage(0.0);
                unattempted.setStatus("UNATTEMPTED");
                unattempted.setRemarks("Did not attend exam - 0 marks awarded");
                unattempted.setStudentAnswers("{}");
                unattempted.setSubmittedAt(sa.getCreatedAt() != null ? sa.getCreatedAt() : LocalDateTime.now());
                submissionRepository.save(unattempted);
            }
        }

        // Query ONLY this student's submissions (strict self-privacy)
        List<StudentExamSubmission> studentSubmissions = submissionRepository.findByStudentUsernameOrderBySubmittedAtDesc(username);

        List<ExamResultResponse> results = new ArrayList<>();
        for (StudentExamSubmission sub : studentSubmissions) {
            Optional<StudentAssignment> saOpt = assignmentRepository.findById(sub.getAssignmentId());
            boolean isReleased = saOpt.isPresent() && Boolean.TRUE.equals(saOpt.get().getResultsReleased());

            // Only expose released results or unattempted records for released exams
            if (isReleased) {
                ExamResultResponse res = new ExamResultResponse();
                res.setSubmissionId(sub.getId());
                res.setAssignmentId(sub.getAssignmentId());
                res.setAssignmentTitle(sub.getAssignmentTitle());
                res.setSubject(sub.getSubject());
                res.setClassStandard(sub.getClassStandard());
                res.setSectionName(sub.getSectionName());
                res.setConductDate(sub.getConductDate());
                res.setTotalQuestions(sub.getTotalQuestions());
                res.setAttemptedQuestions(sub.getAttemptedQuestions());
                res.setCorrectAnswers(sub.getCorrectAnswers());
                res.setScore(sub.getScore());
                res.setTotalMarks(sub.getTotalMarks());
                res.setPercentage(sub.getPercentage());
                res.setStatus(sub.getStatus());
                res.setRemarks(sub.getRemarks());
                res.setSubmittedAt(sub.getSubmittedAt());
                res.setResultsReleased(true);
                results.add(res);
            }
        }

        return ResponseEntity.ok(results);
    }

    /**
     * Review full exam paper with student's answers and correct answers.
     * Only permitted if results are released and only for self!
     */
    @GetMapping("/review/{assignmentId}")
    public ResponseEntity<?> getExamReview(
            @PathVariable Long assignmentId,
            @RequestParam String username) {

        Optional<StudentAssignment> assignOpt = assignmentRepository.findById(assignmentId);
        if (assignOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        StudentAssignment sa = assignOpt.get();
        if (!Boolean.TRUE.equals(sa.getResultsReleased())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Results for this exam have not been published by staff yet."));
        }

        Optional<StudentExamSubmission> subOpt = submissionRepository.findByStudentUsernameAndAssignmentId(username, assignmentId);
        if (subOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No submission record found for this student."));
        }

        StudentExamSubmission sub = subOpt.get();
        Map<String, String> answersMap = new HashMap<>();
        try {
            if (sub.getStudentAnswers() != null && !sub.getStudentAnswers().isBlank()) {
                answersMap = objectMapper.readValue(sub.getStudentAnswers(), new TypeReference<Map<String, String>>() {});
            }
        } catch (Exception ignored) {}

        List<ExamQuestionDto> questions = new ArrayList<>();
        if (sa.getQuestions() != null) {
            for (AssignmentQuestion q : sa.getQuestions()) {
                ExamQuestionDto dto = new ExamQuestionDto();
                dto.setId(q.getId());
                dto.setQuestionNumber(q.getQuestionNumber());
                dto.setQuestionText(q.getQuestionText());
                dto.setOptionA(q.getOptionA());
                dto.setOptionB(q.getOptionB());
                dto.setOptionC(q.getOptionC());
                dto.setOptionD(q.getOptionD());
                dto.setCorrectOption(q.getCorrectOption());

                String chosen = answersMap.get(String.valueOf(q.getQuestionNumber()));
                if (chosen == null && q.getId() != null) {
                    chosen = answersMap.get(String.valueOf(q.getId()));
                }
                dto.setStudentAnswer(chosen != null ? chosen : "Not Answered");
                questions.add(dto);
            }
        }
        questions.sort(Comparator.comparing(ExamQuestionDto::getQuestionNumber));

        Map<String, Object> resp = new HashMap<>();
        resp.put("assignmentId", sa.getId());
        resp.put("assignmentTitle", sa.getAssignmentTitle());
        resp.put("subject", sa.getSubject());
        resp.put("score", sub.getScore());
        resp.put("totalMarks", sub.getTotalMarks());
        resp.put("percentage", sub.getPercentage());
        resp.put("status", sub.getStatus());
        resp.put("remarks", sub.getRemarks());
        resp.put("questions", questions);

        return ResponseEntity.ok(resp);
    }

    /**
     * Resolve student cohort (classStandard and sectionName) from database.
     */
    private StudentCohortResponse resolveCohort(String username, Integer paramClass, String paramSection) {
        if (paramClass != null && paramClass > 0 && paramSection != null && !paramSection.isBlank()) {
            return new StudentCohortResponse(username, username, "", paramClass, paramSection.trim().toUpperCase());
        }

        // 1. Try finding by studentId in student_details
        Optional<StudentDetailsEntity> byId = studentDetailsRepository.findByStudentId(username);
        if (byId.isPresent()) {
            StudentDetailsEntity s = byId.get();
            return new StudentCohortResponse(username, s.getFirstName() + " " + s.getLastName(), s.getStudentId(),
                    s.getClassStandard(), s.getSectionName());
        }

        // 2. Try finding by firstName = username
        List<StudentDetailsEntity> byFirst = studentDetailsRepository.findByFirstNameIgnoreCase(username);
        if (!byFirst.isEmpty()) {
            StudentDetailsEntity s = byFirst.get(0);
            return new StudentCohortResponse(username, s.getFirstName() + " " + s.getLastName(), s.getStudentId(),
                    s.getClassStandard(), s.getSectionName());
        }

        // 3. Fallback for "student" -> Alex Morgan (Class 10, A)
        if ("student".equalsIgnoreCase(username) || "student_gmail".equalsIgnoreCase(username)) {
            List<StudentDetailsEntity> alexList = studentDetailsRepository.findByFirstNameIgnoreCaseAndLastNameIgnoreCase("Alex", "Morgan");
            if (!alexList.isEmpty()) {
                StudentDetailsEntity s = alexList.get(0);
                return new StudentCohortResponse(username, s.getFirstName() + " " + s.getLastName(), s.getStudentId(),
                        s.getClassStandard(), s.getSectionName());
            }
        }

        // 4. Default fallback: Class 10, Section A
        return new StudentCohortResponse(username, username, "", 10, "A");
    }
}
