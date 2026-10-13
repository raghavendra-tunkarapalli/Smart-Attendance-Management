package com.school.studentexamination.repository;

import com.school.studentexamination.entity.StudentAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentAssignmentRepository extends JpaRepository<StudentAssignment, Long> {

    List<StudentAssignment> findByClassStandardAndSectionName(Integer classStandard, String sectionName);

    List<StudentAssignment> findByClassStandardAndSectionNameAndResultsReleased(
            Integer classStandard, String sectionName, Boolean resultsReleased);
}
