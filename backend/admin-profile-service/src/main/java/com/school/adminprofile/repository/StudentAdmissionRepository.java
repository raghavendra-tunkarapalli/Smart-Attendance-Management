package com.school.adminprofile.repository;

import com.school.adminprofile.entity.StudentAdmissionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentAdmissionRepository extends JpaRepository<StudentAdmissionEntity, Long> {

    @Query("SELECT DISTINCT YEAR(a.createdAt) FROM StudentAdmissionEntity a WHERE a.createdAt IS NOT NULL ORDER BY YEAR(a.createdAt) DESC")
    List<Integer> findDistinctYears();

    @Query("SELECT a FROM StudentAdmissionEntity a WHERE YEAR(a.createdAt) = :year ORDER BY a.createdAt DESC")
    List<StudentAdmissionEntity> findByYear(@Param("year") int year);

    @Query("SELECT a FROM StudentAdmissionEntity a WHERE YEAR(a.createdAt) = :year AND MONTH(a.createdAt) = :month ORDER BY a.createdAt DESC")
    List<StudentAdmissionEntity> findByYearAndMonth(@Param("year") int year, @Param("month") int month);
}

