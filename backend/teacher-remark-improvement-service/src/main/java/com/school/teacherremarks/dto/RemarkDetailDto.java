package com.school.teacherremarks.dto;

import com.school.teacherremarks.entity.RemarkAcknowledgment;
import com.school.teacherremarks.entity.TeacherStudentRemark;

import java.time.LocalDateTime;
import java.util.List;

public class RemarkDetailDto {
    private TeacherStudentRemark remark;
    private List<RemarkAcknowledgment> acknowledgments;

    public RemarkDetailDto() {
    }

    public RemarkDetailDto(TeacherStudentRemark remark, List<RemarkAcknowledgment> acknowledgments) {
        this.remark = remark;
        this.acknowledgments = acknowledgments;
    }

    public TeacherStudentRemark getRemark() {
        return remark;
    }

    public void setRemark(TeacherStudentRemark remark) {
        this.remark = remark;
    }

    public List<RemarkAcknowledgment> getAcknowledgments() {
        return acknowledgments;
    }

    public void setAcknowledgments(List<RemarkAcknowledgment> acknowledgments) {
        this.acknowledgments = acknowledgments;
    }
}

