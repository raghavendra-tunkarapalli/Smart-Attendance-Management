package com.school.parentchildacademic.repository;

import com.school.parentchildacademic.entity.StudentAttendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentAttendanceRepository extends JpaRepository<StudentAttendance, Long> {
    List<StudentAttendance> findByStudentId(String studentId);
    List<StudentAttendance> findByStudentNameIgnoreCase(String studentName);
}
