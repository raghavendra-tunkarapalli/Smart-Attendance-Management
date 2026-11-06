package com.school.studentfee.repository;

import com.school.studentfee.entity.StudentFeeDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentFeeDetailRepository extends JpaRepository<StudentFeeDetail, String> {

    Optional<StudentFeeDetail> findByFirstNameIgnoreCase(String firstName);

    Optional<StudentFeeDetail> findByFirstNameIgnoreCaseAndLastNameIgnoreCase(String firstName, String lastName);

    @Query("SELECT s FROM StudentFeeDetail s WHERE LOWER(s.studentId) = LOWER(:id) OR LOWER(s.firstName) = LOWER(:name) OR LOWER(CONCAT(s.firstName, ' ', COALESCE(s.lastName, ''))) = LOWER(:name)")
    List<StudentFeeDetail> searchStudent(@Param("id") String id, @Param("name") String name);
}

