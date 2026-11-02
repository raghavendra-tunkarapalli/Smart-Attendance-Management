package com.school.parenttuitionfee.repository;

import com.school.parenttuitionfee.entity.StudentFeeDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentFeeDetailRepository extends JpaRepository<StudentFeeDetail, String> {
    Optional<StudentFeeDetail> findByStudentId(String studentId);
    List<StudentFeeDetail> findByFirstNameIgnoreCase(String firstName);
    List<StudentFeeDetail> findByParentNameContainingIgnoreCase(String parentName);
}
