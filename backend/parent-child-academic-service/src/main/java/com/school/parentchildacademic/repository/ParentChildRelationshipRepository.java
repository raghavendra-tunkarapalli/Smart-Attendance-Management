package com.school.parentchildacademic.repository;

import com.school.parentchildacademic.entity.ParentChildRelationship;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ParentChildRelationshipRepository extends JpaRepository<ParentChildRelationship, Long> {
    List<ParentChildRelationship> findByParentUserId(Long parentUserId);
    Optional<ParentChildRelationship> findByStudentUsername(String studentUsername);
    Optional<ParentChildRelationship> findByStudentIdentity(String studentIdentity);
    Optional<ParentChildRelationship> findByStudentUniqueId(String studentUniqueId);
}
