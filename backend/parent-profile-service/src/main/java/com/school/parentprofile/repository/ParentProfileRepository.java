package com.school.parentprofile.repository;

import com.school.parentprofile.entity.ParentProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ParentProfileRepository extends JpaRepository<ParentProfile, Long> {
    Optional<ParentProfile> findByUserId(Long userId);
    Optional<ParentProfile> findByEmailIgnoreCase(String email);
    Optional<ParentProfile> findByUsernameIgnoreCase(String username);
    boolean existsByUserId(Long userId);
}
