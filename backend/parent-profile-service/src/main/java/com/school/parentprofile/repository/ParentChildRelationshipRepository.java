package com.school.parentprofile.repository;

import com.school.parentprofile.entity.ParentChildRelationship;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ParentChildRelationshipRepository extends JpaRepository<ParentChildRelationship, Long> {

    // Find all children linked to a parent user
    List<ParentChildRelationship> findByParentUserId(Long parentUserId);

    // Find all parents linked to a student user
    List<ParentChildRelationship> findByStudentUserId(Long studentUserId);

    // Find relationship by student unique id / student identity
    List<ParentChildRelationship> findByStudentIdentity(String studentIdentity);

    List<ParentChildRelationship> findByStudentUniqueId(String studentUniqueId);

    List<ParentChildRelationship> findByStudentUniqueIdIgnoreCase(String studentUniqueId);

    // Find relationship by parent unique id
    List<ParentChildRelationship> findByParentUniqueId(String parentUniqueId);

    // Find relationship by student details id
    List<ParentChildRelationship> findByStudentDetailsId(Long studentDetailsId);

    // Check / find specific relationship between a parent user and student user
    Optional<ParentChildRelationship> findByParentUserIdAndStudentUserId(Long parentUserId, Long studentUserId);

    boolean existsByParentUserIdAndStudentUserId(Long parentUserId, Long studentUserId);

    List<ParentChildRelationship> findByParentEmailIgnoreCase(String parentEmail);

    List<ParentChildRelationship> findByParentNameIgnoreCase(String parentName);

    List<ParentChildRelationship> findByParentNameContainingIgnoreCase(String parentName);

    List<ParentChildRelationship> findByChildNameIgnoreCase(String childName);

    List<ParentChildRelationship> findByStudentNameContainingIgnoreCase(String studentName);

    List<ParentChildRelationship> findByStatusIgnoreCase(String status);

    Optional<ParentChildRelationship> findByParentUserIdAndStudentIdentity(Long parentUserId, String studentIdentity);

    @Query("SELECT r FROM ParentChildRelationship r WHERE r.parentUserId = :parentId AND r.status = 'ACCEPTED'")
    List<ParentChildRelationship> findAcceptedChildrenByParentId(@Param("parentId") Long parentId);

    @Query("SELECT r FROM ParentChildRelationship r WHERE r.studentUserId = :studentId AND r.status = 'ACCEPTED'")
    List<ParentChildRelationship> findAcceptedParentsByStudentId(@Param("studentId") Long studentId);
}
