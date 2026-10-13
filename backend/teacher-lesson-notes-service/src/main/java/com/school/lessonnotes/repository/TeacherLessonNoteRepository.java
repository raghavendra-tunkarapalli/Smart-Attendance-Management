package com.school.lessonnotes.repository;

import com.school.lessonnotes.entity.TeacherLessonNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeacherLessonNoteRepository extends JpaRepository<TeacherLessonNote, Long> {

    List<TeacherLessonNote> findAllByOrderByTimeOfNotesCreatedDesc();

    List<TeacherLessonNote> findByTeacherNameIgnoreCaseOrderByTimeOfNotesCreatedDesc(String teacherName);

    List<TeacherLessonNote> findByTeacherUsernameOrderByTimeOfNotesCreatedDesc(String teacherUsername);

    List<TeacherLessonNote> findByClassNameAndSectionOrderByTimeOfNotesCreatedDesc(String className, String section);

    @Query("SELECT n FROM TeacherLessonNote n WHERE " +
           "(:teacherName IS NULL OR LOWER(n.teacherName) LIKE LOWER(CONCAT('%', :teacherName, '%'))) AND " +
           "(:className IS NULL OR LOWER(n.className) = LOWER(:className)) AND " +
           "(:section IS NULL OR LOWER(n.section) = LOWER(:section)) AND " +
           "(:subject IS NULL OR LOWER(n.subject) LIKE LOWER(CONCAT('%', :subject, '%'))) " +
           "ORDER BY n.timeOfNotesCreated DESC")
    List<TeacherLessonNote> findNotesWithFilters(
            @Param("teacherName") String teacherName,
            @Param("className") String className,
            @Param("section") String section,
            @Param("subject") String subject
    );
}
