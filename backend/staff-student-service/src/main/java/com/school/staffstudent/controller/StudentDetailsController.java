package com.school.staffstudent.controller;

import com.school.staffstudent.entity.AdmissionEntity;
import com.school.staffstudent.entity.StudentDetailsEntity;
import com.school.staffstudent.repository.AdmissionEntityRepository;
import com.school.staffstudent.repository.StudentDetailsRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/staff-student")
public class StudentDetailsController {

    private final StudentDetailsRepository studentRepository;
    private final AdmissionEntityRepository admissionRepository;

    public StudentDetailsController(StudentDetailsRepository studentRepository,
                                    AdmissionEntityRepository admissionRepository) {
        this.studentRepository = studentRepository;
        this.admissionRepository = admissionRepository;
    }

    @GetMapping("/students")
    public ResponseEntity<List<StudentDetailsEntity>> getStudents(
            @RequestParam(required = false) Integer classStandard,
            @RequestParam(required = false) String sectionName) {

        // Dynamically synchronize from admissions table
        syncStudentsFromAdmissions();

        List<StudentDetailsEntity> result;
        if (classStandard != null && sectionName != null) {
            result = studentRepository.findByClassStandardAndSectionName(classStandard, sectionName.toUpperCase());
        } else if (classStandard != null) {
            result = studentRepository.findByClassStandard(classStandard);
        } else if (sectionName != null) {
            result = studentRepository.findBySectionName(sectionName.toUpperCase());
        } else {
            result = studentRepository.findAll();
        }

        return ResponseEntity.ok(result);
    }

    @GetMapping("/students/{studentId}")
    public ResponseEntity<StudentDetailsEntity> getStudentById(@PathVariable String studentId) {
        syncStudentsFromAdmissions();
        return studentRepository.findByStudentId(studentId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    private void syncStudentsFromAdmissions() {
        try {
            // 1. Fetch all accepted admissions from the database
            List<AdmissionEntity> acceptedAdmissions = admissionRepository.findByStatus("ACCEPTED");
            if (acceptedAdmissions == null || acceptedAdmissions.isEmpty()) {
                return;
            }

            // 2. Insert or update accepted students into student_details table without purging referenced records
            for (AdmissionEntity adm : acceptedAdmissions) {
                if (adm.getAdmissionId() == null || adm.getAdmissionId().isBlank()) {
                    continue;
                }

                java.util.Optional<StudentDetailsEntity> existingOpt = studentRepository.findByStudentId(adm.getAdmissionId());
                
                // Parse classStandard from className (e.g. "Grade 10" -> 10)
                int classStandard = parseClassStandard(adm.getClassName());
                // Parse section name (default to 'A')
                String sectionName = adm.getSection() != null && !adm.getSection().trim().isEmpty()
                        ? adm.getSection().trim().toUpperCase()
                        : "A";

                String studentFirstName = adm.getFirstName() != null ? adm.getFirstName() : "";
                String studentLastName = adm.getLastName() != null ? adm.getLastName() : "";

                if ("PARENT".equalsIgnoreCase(adm.getApplicantType()) && adm.getChildName() != null && !adm.getChildName().trim().isEmpty()) {
                    String fullName = adm.getChildName().trim();
                    int lastSpaceIdx = fullName.lastIndexOf(' ');
                    if (lastSpaceIdx > 0) {
                        studentFirstName = fullName.substring(0, lastSpaceIdx).trim();
                        studentLastName = fullName.substring(lastSpaceIdx + 1).trim();
                    } else {
                        studentFirstName = fullName;
                        studentLastName = "";
                    }
                }

                if (existingOpt.isPresent()) {
                    StudentDetailsEntity student = existingOpt.get();
                    student.setFirstName(studentFirstName);
                    student.setLastName(studentLastName);
                    student.setParentName(adm.getParentName() != null ? adm.getParentName() : student.getParentName());
                    student.setClassStandard(classStandard);
                    student.setSectionName(sectionName);
                    studentRepository.save(student);
                } else {
                    StudentDetailsEntity student = new StudentDetailsEntity(
                            adm.getAdmissionId(),
                            studentFirstName,
                            studentLastName,
                            adm.getParentName() != null ? adm.getParentName() : "Parent",
                            classStandard,
                            sectionName
                    );
                    studentRepository.save(student);
                }
            }
        } catch (Exception e) {
            System.err.println("Warning: syncStudentsFromAdmissions error ignored: " + e.getMessage());
        }
    }

    private int parseClassStandard(String className) {
        if (className == null) return 1;
        // Extract all digits from className
        String digits = className.replaceAll("\\D+", "");
        if (digits.isEmpty()) return 1;
        try {
            int val = Integer.parseInt(digits);
            if (val >= 1 && val <= 12) return val;
            return 1;
        } catch (NumberFormatException e) {
            return 1;
        }
    }
}
