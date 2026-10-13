package com.school.studentexamination.repository;

import com.school.studentexamination.entity.AssignmentQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssignmentQuestionRepository extends JpaRepository<AssignmentQuestion, Long> {

    List<AssignmentQuestion> findByAssignmentIdOrderByQuestionNumberAsc(Long assignmentId);
}
