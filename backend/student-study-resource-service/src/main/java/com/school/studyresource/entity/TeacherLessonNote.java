package com.school.studyresource.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "teacher_lesson_notes")
public class TeacherLessonNote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "teacher_name", nullable = false)
    private String teacherName;

    @Column(name = "class_name", nullable = false)
    private String className;

    @Column(name = "section", nullable = false)
    private String section;

    @Column(name = "subject", nullable = false)
    private String subject;

    @Column(name = "topic")
    private String topic;

    @Lob
    @Column(name = "notes_content", columnDefinition = "LONGTEXT", nullable = false)
    private String notesContent;

    @Column(name = "time_of_notes_created", nullable = false)
    private LocalDateTime timeOfNotesCreated;

    @Column(name = "teacher_username")
    private String teacherUsername;

    @Column(name = "teacher_email")
    private String teacherEmail;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public TeacherLessonNote() {
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTeacherName() {
        return teacherName;
    }

    public void setTeacherName(String teacherName) {
        this.teacherName = teacherName;
    }

    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
    }

    public String getSection() {
        return section;
    }

    public void setSection(String section) {
        this.section = section;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }

    public String getNotesContent() {
        return notesContent;
    }

    public void setNotesContent(String notesContent) {
        this.notesContent = notesContent;
    }

    public LocalDateTime getTimeOfNotesCreated() {
        return timeOfNotesCreated;
    }

    public void setTimeOfNotesCreated(LocalDateTime timeOfNotesCreated) {
        this.timeOfNotesCreated = timeOfNotesCreated;
    }

    public String getTeacherUsername() {
        return teacherUsername;
    }

    public void setTeacherUsername(String teacherUsername) {
        this.teacherUsername = teacherUsername;
    }

    public String getTeacherEmail() {
        return teacherEmail;
    }

    public void setTeacherEmail(String teacherEmail) {
        this.teacherEmail = teacherEmail;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
