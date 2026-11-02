package com.school.stafffee.repository;

import com.school.stafffee.entity.StudentFeeDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentFeeDetailRepository extends JpaRepository<StudentFeeDetail, String> {

    List<StudentFeeDetail> findByClassStandardAndSectionName(String classStandard, String sectionName);

    List<StudentFeeDetail> findByClassStandard(String classStandard);

    List<StudentFeeDetail> findBySectionName(String sectionName);

    @Query("SELECT DISTINCT s.classStandard FROM StudentFeeDetail s WHERE s.classStandard IS NOT NULL ORDER BY s.classStandard ASC")
    List<String> findDistinctClasses();

    @Query("SELECT DISTINCT s.sectionName FROM StudentFeeDetail s WHERE s.sectionName IS NOT NULL ORDER BY s.sectionName ASC")
    List<String> findDistinctSections();
}
