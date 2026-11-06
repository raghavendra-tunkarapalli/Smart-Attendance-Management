package com.school.teacherremarks.repository;

import com.school.teacherremarks.entity.TeacherStudentRemark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeacherStudentRemarkRepository extends JpaRepository<TeacherStudentRemark, Long> {

    List<TeacherStudentRemark> findByTeacherUsernameOrderByCreatedAtDesc(String teacherUsername);

    List<TeacherStudentRemark> findAllByOrderByCreatedAtDesc();

    @Query("SELECT r FROM TeacherStudentRemark r WHERE " +
           "(:studentId IS NULL OR r.studentId = :studentId) OR " +
           "(:parentUsername IS NULL OR LOWER(r.parentUsername) = LOWER(:parentUsername)) " +
           "ORDER BY r.createdAt DESC")
    List<TeacherStudentRemark> findForParent(
            @Param("studentId") String studentId,
            @Param("parentUsername") String parentUsername);

    List<TeacherStudentRemark> findByStudentIdOrderByCreatedAtDesc(String studentId);

    List<TeacherStudentRemark> findByParentUsernameOrderByCreatedAtDesc(String parentUsername);
}

