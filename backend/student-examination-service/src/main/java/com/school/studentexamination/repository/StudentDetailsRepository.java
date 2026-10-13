package com.school.studentexamination.repository;

import com.school.studentexamination.entity.StudentDetailsEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentDetailsRepository extends JpaRepository<StudentDetailsEntity, Long> {

    Optional<StudentDetailsEntity> findByStudentId(String studentId);

    List<StudentDetailsEntity> findByFirstNameIgnoreCaseAndLastNameIgnoreCase(String firstName, String lastName);

    List<StudentDetailsEntity> findByFirstNameIgnoreCase(String firstName);
}
