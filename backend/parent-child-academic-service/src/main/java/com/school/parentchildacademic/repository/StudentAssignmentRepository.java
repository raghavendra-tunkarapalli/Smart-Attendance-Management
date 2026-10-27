package com.school.parentchildacademic.repository;

import com.school.parentchildacademic.entity.StudentAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentAssignmentRepository extends JpaRepository<StudentAssignment, Long> {
    List<StudentAssignment> findByClassStandardAndSectionName(Integer classStandard, String sectionName);
}
