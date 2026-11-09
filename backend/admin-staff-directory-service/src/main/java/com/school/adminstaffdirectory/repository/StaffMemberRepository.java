package com.school.adminstaffdirectory.repository;

import com.school.adminstaffdirectory.entity.StaffMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StaffMemberRepository extends JpaRepository<StaffMember, Long> {

    Optional<StaffMember> findByStaffCode(String staffCode);

    Optional<StaffMember> findByUsername(String username);

    List<StaffMember> findByRole(String role);

    List<StaffMember> findByDepartment(String department);
}

