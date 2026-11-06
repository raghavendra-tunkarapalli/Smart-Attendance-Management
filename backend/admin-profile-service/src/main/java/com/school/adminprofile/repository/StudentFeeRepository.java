package com.school.adminprofile.repository;

import com.school.adminprofile.entity.StudentFeeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentFeeRepository extends JpaRepository<StudentFeeEntity, String> {

    List<StudentFeeEntity> findAll();
}

