package com.school.adminstaffdirectory.service;

import com.school.adminstaffdirectory.dto.CreateDirectionRequest;
import com.school.adminstaffdirectory.dto.DirectoryStatsDto;
import com.school.adminstaffdirectory.dto.StaffMemberDto;
import com.school.adminstaffdirectory.entity.StaffDirection;
import com.school.adminstaffdirectory.entity.StaffMember;
import com.school.adminstaffdirectory.repository.StaffDirectionRepository;
import com.school.adminstaffdirectory.repository.StaffMemberRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
public class AdminStaffDirectoryService {

    private final StaffMemberRepository staffRepository;
    private final StaffDirectionRepository directionRepository;

    public AdminStaffDirectoryService(StaffMemberRepository staffRepository,
                                      StaffDirectionRepository directionRepository) {
        this.staffRepository = staffRepository;
        this.directionRepository = directionRepository;
    }

    @PostConstruct
    public void initData() {
        seedStaffIfEmpty();
        seedDirectionsIfEmpty();
    }

    private void seedStaffIfEmpty() {
        if (staffRepository.count() == 0) {
            List<StaffMember> roster = List.of(
                new StaffMember("STF-101", "Michael Scott", "staff", "staff@school.com", "+91 98450 11001",
                        "ADMINISTRATIVE", "Head of Administrative Operations", "Administrative Operations", "ACTIVE", "2024-06-01"),
                new StaffMember("TEA-201", "Dr. Sarah Connor", "teacher", "sarah.connor@school.com", "+91 98450 11002",
                        "FACULTY", "Senior Mathematics Faculty", "Mathematics & Computing", "ACTIVE", "2024-06-01"),
                new StaffMember("TEA-202", "Robert Vance", "teacher", "robert.vance@school.com", "+91 98450 11003",
                        "FACULTY", "Physics & Practical Lab Incharge", "Natural Sciences", "ACTIVE", "2024-06-15"),
                new StaffMember("TEA-203", "Mr. K. Ramarao", "teacher1", "ramarao@school.com", "+91 98450 11004",
                        "FACULTY", "Senior Telugu Lecturer", "Regional Languages", "ACTIVE", "2024-07-01"),
                new StaffMember("TEA-204", "Mrs. S. Sharma", "teacher2", "sharma@school.com", "+91 98450 11005",
                        "FACULTY", "Hindi Literature Instructor", "National Languages", "ACTIVE", "2024-07-01"),
                new StaffMember("TEA-205", "Dr. P. C. Ray", "teacher3", "pcray@school.com", "+91 98450 11006",
                        "FACULTY", "Science & Chemistry Head", "Natural Sciences", "ACTIVE", "2024-07-15"),
                new StaffMember("TEA-206", "Mrs. Rehana Begam", "rehanabegam", "rehana.begam@school.com", "+91 98450 11007",
                        "FACULTY", "Biology & Environmental Studies", "Natural Sciences", "ACTIVE", "2024-08-01"),
                new StaffMember("TEA-207", "Dr. Arthur Miller", "teacher_gmail", "miller.arthur@school.com", "+91 98450 11008",
                        "FACULTY", "English Language & Literature Head", "Humanities & English", "ACTIVE", "2024-08-10"),
                new StaffMember("STF-102", "James Wilson", "staff1", "jwilson@school.com", "+91 98450 11009",
                        "ADMINISTRATIVE", "Examination Cell Registrar", "Examination & Records", "ACTIVE", "2024-08-15"),
                new StaffMember("STF-103", "Priya Nair", "staff_gmail", "pnair@school.com", "+91 98450 11010",
                        "ADMINISTRATIVE", "Student Accounts & Fee Officer", "Finance & Accounts", "ACTIVE", "2024-09-01")
            );
            staffRepository.saveAll(roster);
        }
    }

    private void seedDirectionsIfEmpty() {
        if (directionRepository.count() == 0) {
            List<StaffDirection> initialDirectives = List.of(
                new StaffDirection("DIR-2026-001",
                        "Campus Timetable & 7-Period Daily Workload Compliance",
                        "All teaching faculty are requested to audit weekly timetables. Ensure no faculty exceeds the institutional cap of 7 periods per day, and verify roll call records are signed off daily.",
                        "ALL_STAFF", "ALL", "All Staff Members", "All Departments",
                        "HIGH", "ACTIVE", "2026-11-20", "Super Administrator"),

                new StaffDirection("DIR-2026-002",
                        "Tuition Fee Ledger Synchronization & Term 2 Reconciliation",
                        "Please verify all recent offline parent tuition fee payments and synchronize student installment statuses in the institutional finance portal.",
                        "INDIVIDUAL", "STF-101", "Michael Scott", "Administrative Operations",
                        "URGENT", "ACTIVE", "2026-11-15", "Super Administrator"),

                new StaffDirection("DIR-2026-003",
                        "Class 10 Physics Lab Experiment Record Submissions",
                        "Review student practical analysis logbooks and ensure parent notifications have been dispatched for any missing optics diagram workbooks.",
                        "INDIVIDUAL", "TEA-202", "Robert Vance", "Natural Sciences",
                        "NORMAL", "COMPLETED", "2026-11-10", "Super Administrator")
            );
            directionRepository.saveAll(initialDirectives);
        }
    }

    public List<StaffMemberDto> getAllStaff() {
        List<StaffMember> members = staffRepository.findAll();
        List<StaffDirection> activeDirections = directionRepository.findByStatusOrderByCreatedAtDesc("ACTIVE");

        return members.stream().map(m -> {
            long count = activeDirections.stream().filter(d ->
                    "ALL_STAFF".equalsIgnoreCase(d.getTargetType()) ||
                    (d.getTargetStaffCode() != null && d.getTargetStaffCode().equalsIgnoreCase(m.getStaffCode()))
            ).count();

            return new StaffMemberDto(
                    m.getId(),
                    m.getStaffCode(),
                    m.getFullName(),
                    m.getUsername(),
                    m.getEmail(),
                    m.getPhone(),
                    m.getRole(),
                    m.getDesignation(),
                    m.getDepartment(),
                    m.getStatus(),
                    m.getJoinedDate(),
                    (int) count
            );
        }).collect(Collectors.toList());
    }

    public List<StaffDirection> getAllDirections(String targetStaffCode, String status, String priority, String search) {
        List<StaffDirection> list = directionRepository.findAllByOrderByCreatedAtDesc();

        return list.stream().filter(d -> {
            if (targetStaffCode != null && !targetStaffCode.isBlank() && !"ALL".equalsIgnoreCase(targetStaffCode)) {
                if (!targetStaffCode.equalsIgnoreCase(d.getTargetStaffCode()) && !"ALL_STAFF".equalsIgnoreCase(d.getTargetType())) {
                    return false;
                }
            }
            if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
                if (!status.equalsIgnoreCase(d.getStatus())) {
                    return false;
                }
            }
            if (priority != null && !priority.isBlank() && !"ALL".equalsIgnoreCase(priority)) {
                if (!priority.equalsIgnoreCase(d.getPriority())) {
                    return false;
                }
            }
            if (search != null && !search.isBlank()) {
                String q = search.toLowerCase().trim();
                boolean matchesTitle = d.getTitle() != null && d.getTitle().toLowerCase().contains(q);
                boolean matchesInstruction = d.getInstruction() != null && d.getInstruction().toLowerCase().contains(q);
                boolean matchesTarget = d.getTargetStaffName() != null && d.getTargetStaffName().toLowerCase().contains(q);
                boolean matchesCode = d.getDirectionCode() != null && d.getDirectionCode().toLowerCase().contains(q);
                boolean matchesDept = d.getTargetDepartment() != null && d.getTargetDepartment().toLowerCase().contains(q);
                return matchesTitle || matchesInstruction || matchesTarget || matchesCode || matchesDept;
            }
            return true;
        }).collect(Collectors.toList());
    }

    public Optional<StaffDirection> getDirectionById(Long id) {
        return directionRepository.findById(id);
    }

    @Transactional
    public StaffDirection createDirection(CreateDirectionRequest request) {
        String code = "DIR-2026-" + (100 + ThreadLocalRandom.current().nextInt(900));

        String targetType = request.getTargetType() != null && !request.getTargetType().isBlank()
                ? request.getTargetType() : "ALL_STAFF";

        String targetCode = request.getTargetStaffCode();
        String targetName = request.getTargetStaffName();
        String targetDept = request.getTargetDepartment();

        if ("ALL_STAFF".equalsIgnoreCase(targetType) || "ALL".equalsIgnoreCase(targetCode) || targetCode == null) {
            targetType = "ALL_STAFF";
            targetCode = "ALL";
            targetName = "All Staff Members";
            targetDept = "All Departments";
        } else {
            // Find staff member to ensure name & department are exact
            Optional<StaffMember> memberOpt = staffRepository.findByStaffCode(targetCode);
            if (memberOpt.isPresent()) {
                StaffMember m = memberOpt.get();
                targetName = m.getFullName();
                targetDept = m.getDepartment();
            } else if (targetName == null || targetName.isBlank()) {
                targetName = "Staff Member (" + targetCode + ")";
            }
        }

        String priority = request.getPriority() != null && !request.getPriority().isBlank()
                ? request.getPriority().toUpperCase() : "NORMAL";

        String issuedBy = request.getIssuedBy() != null && !request.getIssuedBy().isBlank()
                ? request.getIssuedBy() : "Super Administrator";

        StaffDirection direction = new StaffDirection(
                code,
                request.getTitle().trim(),
                request.getInstruction().trim(),
                targetType,
                targetCode,
                targetName,
                targetDept,
                priority,
                "ACTIVE",
                request.getDueDate(),
                issuedBy
        );

        return directionRepository.save(direction);
    }

    @Transactional
    public Optional<StaffDirection> updateDirectionStatus(Long id, String status) {
        return directionRepository.findById(id).map(d -> {
            d.setStatus(status.toUpperCase());
            d.setUpdatedAt(LocalDateTime.now());
            return directionRepository.save(d);
        });
    }

    @Transactional
    public boolean deleteDirection(Long id) {
        if (directionRepository.existsById(id)) {
            directionRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public DirectoryStatsDto getStats() {
        long totalStaff = staffRepository.count();
        long facultyCount = staffRepository.findByRole("FACULTY").size();
        long administrativeCount = staffRepository.findByRole("ADMINISTRATIVE").size();

        long totalDirections = directionRepository.count();
        long activeDirections = directionRepository.countByStatus("ACTIVE");
        long urgentDirections = directionRepository.countByPriority("URGENT");
        long completedDirections = directionRepository.countByStatus("COMPLETED");

        return new DirectoryStatsDto(
                totalStaff,
                facultyCount,
                administrativeCount,
                totalDirections,
                activeDirections,
                urgentDirections,
                completedDirections
        );
    }
}

