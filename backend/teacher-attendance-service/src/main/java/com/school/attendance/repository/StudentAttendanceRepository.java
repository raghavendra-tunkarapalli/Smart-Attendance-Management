package com.school.attendance.repository;

import com.school.attendance.entity.StudentAttendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface StudentAttendanceRepository extends JpaRepository<StudentAttendance, Long> {
    List<StudentAttendance> findByClassStandardAndSectionNameAndAttendanceDate(Integer classStandard, String sectionName, LocalDate date);
    List<StudentAttendance> findByClassStandardAndSectionNameAndAttendanceDateAndPeriodIndex(Integer classStandard, String sectionName, LocalDate date, Integer periodIndex);
    Optional<StudentAttendance> findByStudentIdAndAttendanceDate(String studentId, LocalDate date);
    Optional<StudentAttendance> findByStudentIdAndAttendanceDateAndPeriodIndex(String studentId, LocalDate date, Integer periodIndex);
    List<StudentAttendance> findByStudentIdOrderByAttendanceDateDesc(String studentId);
    List<StudentAttendance> findByStudentIdAndAttendanceDateOrderByPeriodIndexAsc(String studentId, LocalDate date);
    List<StudentAttendance> findByClassStandardAndSectionNameAndAttendanceDateBetween(Integer classStandard, String sectionName, LocalDate start, LocalDate end);
    List<StudentAttendance> findByStudentIdAndAttendanceDateBetween(String studentId, LocalDate start, LocalDate end);
}
