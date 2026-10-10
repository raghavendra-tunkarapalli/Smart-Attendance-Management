package com.school.attendance.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "student_attendance")
public class StudentAttendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", nullable = false)
    private String studentId;

    @Column(name = "student_name", nullable = false)
    private String studentName;

    @Column(name = "parent_name")
    private String parentName;

    @Column(name = "class_standard", nullable = false)
    private Integer classStandard;

    @Column(name = "section_name", nullable = false)
    private String sectionName;

    @Column(name = "attendance_date", nullable = false)
    private LocalDate attendanceDate;

    @Column(name = "status", nullable = false) // "PRESENT" or "ABSENT"
    private String status;

    @Column(name = "period_index")
    private Integer periodIndex;

    @Column(name = "timing")
    private String timing;

    @Column(name = "subject_name")
    private String subjectName;

    @Column(name = "teacher_name")
    private String teacherName;

    public StudentAttendance() {}

    public StudentAttendance(String studentId, String studentName, String parentName, Integer classStandard, String sectionName, LocalDate attendanceDate, String status) {
        this.studentId = studentId;
        this.studentName = studentName;
        this.parentName = parentName;
        this.classStandard = classStandard;
        this.sectionName = sectionName;
        this.attendanceDate = attendanceDate;
        this.status = status;
    }

    public StudentAttendance(String studentId, String studentName, String parentName, Integer classStandard, String sectionName, LocalDate attendanceDate, String status, Integer periodIndex, String timing, String subjectName, String teacherName) {
        this.studentId = studentId;
        this.studentName = studentName;
        this.parentName = parentName;
        this.classStandard = classStandard;
        this.sectionName = sectionName;
        this.attendanceDate = attendanceDate;
        this.status = status;
        this.periodIndex = periodIndex;
        this.timing = timing;
        this.subjectName = subjectName;
        this.teacherName = teacherName;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getParentName() { return parentName; }
    public void setParentName(String parentName) { this.parentName = parentName; }

    public Integer getClassStandard() { return classStandard; }
    public void setClassStandard(Integer classStandard) { this.classStandard = classStandard; }

    public String getSectionName() { return sectionName; }
    public void setSectionName(String sectionName) { this.sectionName = sectionName; }

    public LocalDate getAttendanceDate() { return attendanceDate; }
    public void setAttendanceDate(LocalDate attendanceDate) { this.attendanceDate = attendanceDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getPeriodIndex() { return periodIndex; }
    public void setPeriodIndex(Integer periodIndex) { this.periodIndex = periodIndex; }

    public String getTiming() { return timing; }
    public void setTiming(String timing) { this.timing = timing; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public String getTeacherName() { return teacherName; }
    public void setTeacherName(String teacherName) { this.teacherName = teacherName; }
}
