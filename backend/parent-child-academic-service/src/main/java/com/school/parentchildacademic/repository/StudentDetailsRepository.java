package com.school.parentchildacademic.repository;

import com.school.parentchildacademic.entity.StudentDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentDetailsRepository extends JpaRepository<StudentDetails, Long> {
    Optional<StudentDetails> findByStudentId(String studentId);
    List<StudentDetails> findByFirstNameIgnoreCase(String firstName);
    List<StudentDetails> findByFirstNameIgnoreCaseAndLastNameIgnoreCase(String firstName, String lastName);
}
