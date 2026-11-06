package com.school.teacherremarks.repository;

import com.school.teacherremarks.entity.RemarkAcknowledgment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RemarkAcknowledgmentRepository extends JpaRepository<RemarkAcknowledgment, Long> {

    List<RemarkAcknowledgment> findByRemarkIdOrderByAcknowledgedAtDesc(Long remarkId);

    Optional<RemarkAcknowledgment> findFirstByRemarkIdOrderByAcknowledgedAtDesc(Long remarkId);

    List<RemarkAcknowledgment> findByParentUsernameOrderByAcknowledgedAtDesc(String parentUsername);

    List<RemarkAcknowledgment> findByStudentIdOrderByAcknowledgedAtDesc(String studentId);
}

