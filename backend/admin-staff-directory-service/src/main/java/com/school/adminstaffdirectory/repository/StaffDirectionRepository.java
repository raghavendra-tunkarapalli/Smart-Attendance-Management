package com.school.adminstaffdirectory.repository;

import com.school.adminstaffdirectory.entity.StaffDirection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StaffDirectionRepository extends JpaRepository<StaffDirection, Long> {

    List<StaffDirection> findAllByOrderByCreatedAtDesc();

    Optional<StaffDirection> findByDirectionCode(String directionCode);

    List<StaffDirection> findByTargetStaffCodeOrderByCreatedAtDesc(String targetStaffCode);

    List<StaffDirection> findByStatusOrderByCreatedAtDesc(String status);

    List<StaffDirection> findByPriorityOrderByCreatedAtDesc(String priority);

    long countByStatus(String status);

    long countByPriority(String priority);
}

