package com.school.staffadmindirectory.repository;

import com.school.staffadmindirectory.entity.StaffAdminDirection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StaffAdminDirectionRepository extends JpaRepository<StaffAdminDirection, Long> {

    List<StaffAdminDirection> findAllByOrderByCreatedAtDesc();

    Optional<StaffAdminDirection> findByDirectionCode(String directionCode);

    @Query("SELECT d FROM StaffAdminDirection d WHERE " +
           "d.targetType = 'ALL_STAFF' OR " +
           "LOWER(d.targetStaffCode) = LOWER(:code) OR " +
           "LOWER(d.targetStaffName) LIKE LOWER(CONCAT('%', :name, '%')) " +
           "ORDER BY d.createdAt DESC")
    List<StaffAdminDirection> findDirectionsForStaff(
            @Param("code") String code,
            @Param("name") String name
    );
}

