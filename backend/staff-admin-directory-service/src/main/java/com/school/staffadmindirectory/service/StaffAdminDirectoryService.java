package com.school.staffadmindirectory.service;

import com.school.staffadmindirectory.dto.AcknowledgeDirectionRequest;
import com.school.staffadmindirectory.dto.StaffDirectionDto;
import com.school.staffadmindirectory.dto.StaffDirectorySummaryDto;
import com.school.staffadmindirectory.entity.StaffAdminDirection;
import com.school.staffadmindirectory.entity.StaffMember;
import com.school.staffadmindirectory.repository.StaffAdminDirectionRepository;
import com.school.staffadmindirectory.repository.StaffMemberRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class StaffAdminDirectoryService {

    private final StaffAdminDirectionRepository directionRepository;
    private final StaffMemberRepository staffRepository;

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("MMM dd, yyyy, hh:mm a");

    public StaffAdminDirectoryService(StaffAdminDirectionRepository directionRepository,
                                     StaffMemberRepository staffRepository) {
        this.directionRepository = directionRepository;
        this.staffRepository = staffRepository;
    }

    public StaffMember resolveStaffMember(String identifier) {
        if (identifier == null || identifier.isBlank()) {
            identifier = "staff";
        }
        String cleanId = identifier.trim();

        // 1. Try username
        Optional<StaffMember> opt = staffRepository.findByUsernameIgnoreCase(cleanId);
        if (opt.isPresent()) return opt.get();

        // 2. Try email
        opt = staffRepository.findByEmailIgnoreCase(cleanId);
        if (opt.isPresent()) return opt.get();

        // 3. Try staffCode
        opt = staffRepository.findByStaffCodeIgnoreCase(cleanId);
        if (opt.isPresent()) return opt.get();

        // Default fallback for staff portal
        StaffMember fallback = new StaffMember();
        fallback.setStaffCode("STF-101");
        fallback.setFullName("Michael Scott");
        fallback.setUsername(cleanId);
        fallback.setEmail(cleanId.contains("@") ? cleanId : cleanId + "@school.com");
        fallback.setDepartment("Administrative Operations");
        fallback.setRole("ADMINISTRATIVE");
        fallback.setDesignation("Head of Administrative Operations");
        fallback.setStatus("ACTIVE");
        return fallback;
    }

    public List<StaffDirectionDto> getDirectionsForStaff(String identifier, String filter, String search) {
        StaffMember staff = resolveStaffMember(identifier);
        String staffCode = staff.getStaffCode();
        String staffName = staff.getFullName();

        List<StaffAdminDirection> rawList = directionRepository.findDirectionsForStaff(staffCode, staffName);

        return rawList.stream()
                .map(d -> toDto(d, staffCode))
                .filter(dto -> {
                    // Filter matching
                    if (filter != null && !filter.isBlank() && !"ALL".equalsIgnoreCase(filter)) {
                        switch (filter.toUpperCase()) {
                            case "PERSONAL":
                                if (!dto.isDirectTarget()) return false;
                                break;
                            case "BROADCAST":
                                if (!"ALL_STAFF".equalsIgnoreCase(dto.getTargetType())) return false;
                                break;
                            case "PENDING":
                                if ("COMPLETED".equalsIgnoreCase(dto.getStatus())) return false;
                                break;
                            case "COMPLETED":
                                if (!"COMPLETED".equalsIgnoreCase(dto.getStatus())) return false;
                                break;
                            case "URGENT":
                                if (!"URGENT".equalsIgnoreCase(dto.getPriority())) return false;
                                break;
                            default:
                                break;
                        }
                    }

                    // Search matching
                    if (search != null && !search.isBlank()) {
                        String q = search.toLowerCase().trim();
                        boolean matchesTitle = dto.getTitle() != null && dto.getTitle().toLowerCase().contains(q);
                        boolean matchesInstruction = dto.getInstruction() != null && dto.getInstruction().toLowerCase().contains(q);
                        boolean matchesCode = dto.getDirectionCode() != null && dto.getDirectionCode().toLowerCase().contains(q);
                        boolean matchesDept = dto.getTargetDepartment() != null && dto.getTargetDepartment().toLowerCase().contains(q);
                        boolean matchesIssuedBy = dto.getIssuedBy() != null && dto.getIssuedBy().toLowerCase().contains(q);
                        return matchesTitle || matchesInstruction || matchesCode || matchesDept || matchesIssuedBy;
                    }

                    return true;
                })
                .collect(Collectors.toList());
    }

    public Optional<StaffDirectionDto> getDirectionById(Long id, String identifier) {
        StaffMember staff = resolveStaffMember(identifier);
        return directionRepository.findById(id).map(d -> toDto(d, staff.getStaffCode()));
    }

    @Transactional
    public Optional<StaffDirectionDto> acknowledgeDirection(Long id, AcknowledgeDirectionRequest request) {
        return directionRepository.findById(id).map(d -> {
            StaffMember staff = resolveStaffMember(request.getStaffUsername());

            // Broadcast notices to ALL_STAFF do not have individual acknowledgment
            if ("ALL_STAFF".equalsIgnoreCase(d.getTargetType())) {
                return toDto(d, staff.getStaffCode());
            }

            String newStatus = request.getStatus();
            if (newStatus == null || newStatus.isBlank()) {
                newStatus = "ACKNOWLEDGED";
            }
            d.setStatus(newStatus.toUpperCase());
            d.setAcknowledged(true);
            d.setAcknowledgedAt(LocalDateTime.now());

            if (request.getStaffName() != null && !request.getStaffName().isBlank()) {
                d.setAcknowledgedBy(request.getStaffName());
            } else if (request.getStaffUsername() != null) {
                d.setAcknowledgedBy(request.getStaffUsername());
            } else {
                d.setAcknowledgedBy("Staff Member");
            }

            if (request.getResponseNote() != null && !request.getResponseNote().isBlank()) {
                d.setStaffResponseNote(request.getResponseNote().trim());
            }

            d.setUpdatedAt(LocalDateTime.now());
            StaffAdminDirection saved = directionRepository.save(d);

            return toDto(saved, staff.getStaffCode());
        });
    }

    @Transactional
    public Optional<StaffDirectionDto> toggleSeen(Long id, String staffUsername, String staffName) {
        return directionRepository.findById(id).map(d -> {
            StaffMember staff = resolveStaffMember(staffUsername);

            // Broadcast notices to ALL_STAFF do not have individual acknowledgment
            if ("ALL_STAFF".equalsIgnoreCase(d.getTargetType())) {
                return toDto(d, staff.getStaffCode());
            }

            boolean currentlySeen = d.getAcknowledged() != null && d.getAcknowledged();
            boolean newSeen = !currentlySeen;
            d.setAcknowledged(newSeen);

            if (newSeen) {
                d.setStatus("ACKNOWLEDGED");
                d.setAcknowledgedAt(LocalDateTime.now());
                if (staffName != null && !staffName.isBlank()) {
                    d.setAcknowledgedBy(staffName);
                } else if (staffUsername != null && !staffUsername.isBlank()) {
                    d.setAcknowledgedBy(staffUsername);
                } else {
                    d.setAcknowledgedBy("Staff Member");
                }
                d.setStaffResponseNote("Viewed and verified by staff.");
            } else {
                d.setStatus("ACTIVE");
                d.setAcknowledgedAt(null);
                d.setAcknowledgedBy(null);
                d.setStaffResponseNote(null);
            }

            d.setUpdatedAt(LocalDateTime.now());
            StaffAdminDirection saved = directionRepository.save(d);

            return toDto(saved, staff.getStaffCode());
        });
    }

    public StaffDirectorySummaryDto getSummaryStats(String identifier) {
        StaffMember staff = resolveStaffMember(identifier);
        List<StaffDirectionDto> all = getDirectionsForStaff(identifier, "ALL", null);

        long totalDirectives = all.size();
        long personalDirectives = all.stream().filter(StaffDirectionDto::isDirectTarget).count();
        long broadcastDirectives = all.stream().filter(d -> "ALL_STAFF".equalsIgnoreCase(d.getTargetType())).count();
        long pendingAction = all.stream().filter(d -> !"COMPLETED".equalsIgnoreCase(d.getStatus())).count();
        long urgentCount = all.stream().filter(d -> "URGENT".equalsIgnoreCase(d.getPriority())).count();
        long completedCount = all.stream().filter(d -> "COMPLETED".equalsIgnoreCase(d.getStatus())).count();

        StaffDirectorySummaryDto summary = new StaffDirectorySummaryDto();
        summary.setStaffName(staff.getFullName());
        summary.setStaffCode(staff.getStaffCode());
        summary.setDepartment(staff.getDepartment());
        summary.setRole(staff.getRole());
        summary.setTotalDirectives(totalDirectives);
        summary.setPersonalDirectives(personalDirectives);
        summary.setBroadcastDirectives(broadcastDirectives);
        summary.setPendingAction(pendingAction);
        summary.setUrgentCount(urgentCount);
        summary.setCompletedCount(completedCount);
        return summary;
    }

    private StaffDirectionDto toDto(StaffAdminDirection d, String currentStaffCode) {
        StaffDirectionDto dto = new StaffDirectionDto();
        dto.setId(d.getId());
        dto.setDirectionCode(d.getDirectionCode());
        dto.setTitle(d.getTitle());
        dto.setInstruction(d.getInstruction());
        dto.setTargetType(d.getTargetType());
        dto.setTargetStaffCode(d.getTargetStaffCode());
        dto.setTargetStaffName(d.getTargetStaffName());
        dto.setTargetDepartment(d.getTargetDepartment());
        dto.setPriority(d.getPriority());
        dto.setStatus(d.getStatus());
        dto.setDueDate(d.getDueDate());
        dto.setIssuedBy(d.getIssuedBy());
        dto.setCreatedAt(d.getCreatedAt());

        if (d.getCreatedAt() != null) {
            dto.setFormattedCreatedAt(d.getCreatedAt().format(FORMATTER));
        }

        // isDirectTarget = true if assigned specifically to this staff code
        boolean isDirect = d.getTargetStaffCode() != null &&
                !"ALL".equalsIgnoreCase(d.getTargetStaffCode()) &&
                d.getTargetStaffCode().equalsIgnoreCase(currentStaffCode);
        dto.setDirectTarget(isDirect);

        // Only targeted individual directives have acknowledgment tracking
        boolean isTargeted = !"ALL_STAFF".equalsIgnoreCase(d.getTargetType()) && "INDIVIDUAL".equalsIgnoreCase(d.getTargetType());
        if (!isTargeted) {
            dto.setAcknowledged(false);
            dto.setAcknowledgedAt(null);
            dto.setFormattedAcknowledgedAt(null);
            dto.setAcknowledgedBy(null);
            dto.setStaffResponseNote(null);
        } else {
            dto.setAcknowledged(d.getAcknowledged() != null && d.getAcknowledged());
            if (d.getAcknowledgedAt() != null) {
                String formattedAck = d.getAcknowledgedAt().format(FORMATTER);
                dto.setAcknowledgedAt(formattedAck);
                dto.setFormattedAcknowledgedAt(formattedAck);
            }
            dto.setAcknowledgedBy(d.getAcknowledgedBy());
            dto.setStaffResponseNote(d.getStaffResponseNote());
        }

        return dto;
    }
}

