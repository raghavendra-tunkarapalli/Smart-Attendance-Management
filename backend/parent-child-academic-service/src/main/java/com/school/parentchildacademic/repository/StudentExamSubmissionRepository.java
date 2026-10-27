package com.school.parentchildacademic.repository;

import com.school.parentchildacademic.entity.StudentExamSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentExamSubmissionRepository extends JpaRepository<StudentExamSubmission, Long> {
    List<StudentExamSubmission> findByStudentUsername(String studentUsername);
    Optional<StudentExamSubmission> findByStudentUsernameAndAssignmentId(String studentUsername, Long assignmentId);
}
