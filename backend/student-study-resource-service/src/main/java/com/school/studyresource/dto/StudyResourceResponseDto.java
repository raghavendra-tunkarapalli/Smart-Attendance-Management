package com.school.studyresource.dto;

import com.school.studyresource.entity.TeacherLessonNote;
import java.time.LocalDateTime;

public class StudyResourceResponseDto {

    private Long id;
    private String teacherName;
    private String className;
    private String section;
    private String subject;
    private String topic;
    private String notesContent;
    private LocalDateTime timeOfNotesCreated;
    private String teacherUsername;
    private String teacherEmail;
    private String formattedDate;

    public StudyResourceResponseDto() {
    }

    public StudyResourceResponseDto(TeacherLessonNote note) {
        this.id = note.getId();
        this.teacherName = note.getTeacherName();
        this.className = note.getClassName();
        this.section = note.getSection();
        this.subject = note.getSubject();
        this.topic = note.getTopic();
        this.notesContent = note.getNotesContent();
        this.timeOfNotesCreated = note.getTimeOfNotesCreated();
        this.teacherUsername = note.getTeacherUsername();
        this.teacherEmail = note.getTeacherEmail();
    }

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

    public String getFormattedDate() {
        return formattedDate;
    }

    public void setFormattedDate(String formattedDate) {
        this.formattedDate = formattedDate;
    }
}
