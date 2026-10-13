package com.school.studentexamination.repository;

import com.school.studentexamination.entity.StudentExamSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentExamSubmissionRepository extends JpaRepository<StudentExamSubmission, Long> {

    Optional<StudentExamSubmission> findByStudentUsernameAndAssignmentId(String studentUsername, Long assignmentId);

    boolean existsByStudentUsernameAndAssignmentId(String studentUsername, Long assignmentId);

    List<StudentExamSubmission> findByStudentUsernameOrderBySubmittedAtDesc(String studentUsername);

    List<StudentExamSubmission> findByStudentUsername(String studentUsername);
}
