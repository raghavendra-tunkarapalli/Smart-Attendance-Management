package com.school.parentprofile.repository;

import com.school.parentprofile.entity.StudentDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentDetailsRepository extends JpaRepository<StudentDetails, Long> {

    Optional<StudentDetails> findByStudentId(String studentId);

    List<StudentDetails> findByParentNameIgnoreCase(String parentName);

    List<StudentDetails> findByParentNameContainingIgnoreCase(String parentName);

    @Query("SELECT s FROM StudentDetails s WHERE " +
           "LOWER(s.studentId) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.lastName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.parentName) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<StudentDetails> searchStudents(@Param("query") String query);
}
