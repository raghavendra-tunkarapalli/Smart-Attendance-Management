package com.school.staffadmindirectory.repository;

import com.school.staffadmindirectory.entity.StaffMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StaffMemberRepository extends JpaRepository<StaffMember, Long> {

    Optional<StaffMember> findByUsernameIgnoreCase(String username);

    Optional<StaffMember> findByEmailIgnoreCase(String email);

    Optional<StaffMember> findByStaffCodeIgnoreCase(String staffCode);
}

