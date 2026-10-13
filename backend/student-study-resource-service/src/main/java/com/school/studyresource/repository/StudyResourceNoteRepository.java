package com.school.studyresource.repository;

import com.school.studyresource.entity.TeacherLessonNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudyResourceNoteRepository extends JpaRepository<TeacherLessonNote, Long> {

    List<TeacherLessonNote> findAllByOrderByTimeOfNotesCreatedDesc();

    @Query(value = "SELECT * FROM teacher_lesson_notes n WHERE " +
           "(:classPattern IS NULL OR LOWER(n.class_name) LIKE CONCAT('%', LOWER(:classPattern), '%')) AND " +
           "(:section IS NULL OR LOWER(n.section) = LOWER(:section)) AND " +
           "(:subject IS NULL OR LOWER(n.subject) LIKE CONCAT('%', LOWER(:subject), '%')) AND " +
           "(:teacherName IS NULL OR LOWER(n.teacher_name) LIKE CONCAT('%', LOWER(:teacherName), '%')) AND " +
           "(:search IS NULL OR LOWER(n.topic) LIKE CONCAT('%', LOWER(:search), '%') OR LOWER(n.notes_content) LIKE CONCAT('%', LOWER(:search), '%')) " +
           "ORDER BY n.time_of_notes_created DESC", nativeQuery = true)
    List<TeacherLessonNote> findStudentNotes(
            @Param("classPattern") String classPattern,
            @Param("section") String section,
            @Param("subject") String subject,
            @Param("teacherName") String teacherName,
            @Param("search") String search
    );

    @Query(value = "SELECT DISTINCT n.subject FROM teacher_lesson_notes n WHERE " +
           "(:classPattern IS NULL OR LOWER(n.class_name) LIKE CONCAT('%', LOWER(:classPattern), '%')) AND " +
           "(:section IS NULL OR LOWER(n.section) = LOWER(:section))", nativeQuery = true)
    List<String> findDistinctSubjects(
            @Param("classPattern") String classPattern,
            @Param("section") String section
    );

    @Query(value = "SELECT DISTINCT n.teacher_name FROM teacher_lesson_notes n WHERE " +
           "(:classPattern IS NULL OR LOWER(n.class_name) LIKE CONCAT('%', LOWER(:classPattern), '%')) AND " +
           "(:section IS NULL OR LOWER(n.section) = LOWER(:section))", nativeQuery = true)
    List<String> findDistinctTeachers(
            @Param("classPattern") String classPattern,
            @Param("section") String section
    );
}
