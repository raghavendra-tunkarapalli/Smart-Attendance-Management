package com.school.examination.repository;

import com.school.examination.entity.StudentAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentAssignmentRepository extends JpaRepository<StudentAssignment, Long> {
    List<StudentAssignment> findByClassStandardAndSectionNameOrderByCreatedAtDesc(Integer classStandard, String sectionName);
    List<StudentAssignment> findAllByOrderByCreatedAtDesc();
    List<StudentAssignment> findByClassStandardOrderByCreatedAtDesc(Integer classStandard);
}
