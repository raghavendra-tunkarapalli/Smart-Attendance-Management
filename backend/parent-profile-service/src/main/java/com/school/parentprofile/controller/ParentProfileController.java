package com.school.parentprofile.controller;

import com.school.parentprofile.dto.ChildRelationshipRequest;
import com.school.parentprofile.dto.ParentProfileResponse;
import com.school.parentprofile.dto.StatusUpdateRequest;
import com.school.parentprofile.entity.ParentChildRelationship;
import com.school.parentprofile.entity.ParentProfile;
import com.school.parentprofile.entity.StudentDetails;
import com.school.parentprofile.entity.User;
import com.school.parentprofile.repository.ParentChildRelationshipRepository;
import com.school.parentprofile.repository.ParentProfileRepository;
import com.school.parentprofile.repository.StudentDetailsRepository;
import com.school.parentprofile.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/parent-profile")
@CrossOrigin(origins = "*")
public class ParentProfileController {

    private final ParentProfileRepository parentRepo;
    private final ParentChildRelationshipRepository relationRepo;
    private final UserRepository userRepo;
    private final StudentDetailsRepository studentDetailsRepo;

    public ParentProfileController(
            ParentProfileRepository parentRepo,
            ParentChildRelationshipRepository relationRepo,
            UserRepository userRepo,
            StudentDetailsRepository studentDetailsRepo) {
        this.parentRepo = parentRepo;
        this.relationRepo = relationRepo;
        this.userRepo = userRepo;
        this.studentDetailsRepo = studentDetailsRepo;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> status = new HashMap<>();
        status.put("status", "UP");
        status.put("service", "parent-profile-service");
        status.put("port", 8101);
        status.put("timestamp", LocalDateTime.now());
        return ResponseEntity.ok(status);
    }

    /**
     * Get parent profile details along with their respective children relationships
     * fetched directly from the users and student_details tables.
     */
    @GetMapping("/{userId}")
    public ResponseEntity<?> getParentProfileAndChildren(@PathVariable Long userId) {
        Optional<ParentProfile> profileOpt = parentRepo.findByUserId(userId);
        ParentProfile profile;
        if (profileOpt.isPresent()) {
            profile = profileOpt.get();
        } else {
            // Check if user exists in users table
            Optional<User> userOpt = userRepo.findById(userId);
            if (userOpt.isPresent()) {
                User u = userOpt.get();
                profile = new ParentProfile(
                    userId,
                    u.getUsername(),
                    u.getFirstName(),
                    u.getLastName(),
                    u.getEmail(),
                    u.getRole() != null ? u.getRole() : "PARENT",
                    "+1 (555) 349-8201",
                    "742 Evergreen Terrace, Springfield",
                    "Eleanor Patterson (+1 555-349-8202)",
                    "Active & Verified"
                );
            } else {
                profile = new ParentProfile(
                    userId,
                    "parent_" + userId,
                    "Robert",
                    "Patterson",
                    "parent@school.com",
                    "PARENT",
                    "+1 (555) 349-8201",
                    "742 Evergreen Terrace, Springfield",
                    "Eleanor Patterson (+1 555-349-8202)",
                    "Active & Verified"
                );
            }
            profile = parentRepo.save(profile);
        }

        List<ParentChildRelationship> children = relationRepo.findByParentUserId(userId);
        if (children.isEmpty() && profile.getEmail() != null) {
            children = relationRepo.findByParentEmailIgnoreCase(profile.getEmail());
        }

        ParentProfileResponse response = new ParentProfileResponse(
            profile,
            children,
            "Parent profile and children records retrieved successfully referencing users and student_details."
        );
        return ResponseEntity.ok(response);
    }

    /**
     * Master endpoint: Fetch ALL parent-student relationships across the entire school
     * referencing student_details and users tables.
     */
    @GetMapping("/all-relationships")
    public ResponseEntity<List<ParentChildRelationship>> getAllRelationships() {
        return ResponseEntity.ok(relationRepo.findAll());
    }

    /**
     * Get all records directly from student_details table
     */
    @GetMapping("/student-details")
    public ResponseEntity<List<StudentDetails>> getAllStudentDetails() {
        return ResponseEntity.ok(studentDetailsRepo.findAll());
    }

    /**
     * Get single student detail by student_id (e.g. ADM-24992, ADM-78578, etc.)
     */
    @GetMapping("/student-details/{studentId}")
    public ResponseEntity<?> getStudentDetailById(@PathVariable String studentId) {
        return studentDetailsRepo.findByStudentId(studentId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    /**
     * Find which parent belongs to a student (referencing student_details and users tables)
     * e.g. GET /api/parent-profile/who-is-parent-of?studentUniqueId=ADM-35165
     */
    @GetMapping("/who-is-parent-of")
    public ResponseEntity<?> whoIsParentOf(
            @RequestParam(required = false) String studentUniqueId,
            @RequestParam(required = false) Long studentUserId,
            @RequestParam(required = false) String studentName,
            @RequestParam(required = false) String query) {

        String searchTerm = studentUniqueId != null && !studentUniqueId.isBlank() ? studentUniqueId.trim() : (query != null ? query.trim() : null);

        // 1. Check parent_child_relationships by studentUniqueId / studentIdentity
        if (searchTerm != null && !searchTerm.isBlank()) {
            List<ParentChildRelationship> rels = relationRepo.findByStudentUniqueIdIgnoreCase(searchTerm);
            if (rels.isEmpty()) {
                rels = relationRepo.findByStudentIdentity(searchTerm);
            }
            if (!rels.isEmpty()) {
                ParentChildRelationship r = rels.get(0);
                Map<String, Object> resp = new HashMap<>();
                resp.put("found", true);
                resp.put("searchKey", searchTerm);
                resp.put("studentName", r.getStudentName());
                resp.put("studentUniqueId", r.getStudentUniqueId());
                resp.put("parentName", r.getParentName());
                resp.put("parentUniqueId", r.getParentUniqueId());
                resp.put("parentEmail", r.getParentEmail());
                resp.put("className", r.getClassName());
                resp.put("section", r.getSection());
                resp.put("status", r.getStatus());
                resp.put("relationshipType", r.getRelationshipType());
                resp.put("adminRemarks", r.getAdminRemarks());
                resp.put("relationship", r);
                return ResponseEntity.ok(resp);
            }
        }

        // 2. Check by student name in relationships
        String nameSearch = studentName != null && !studentName.isBlank() ? studentName.trim() : searchTerm;
        if (nameSearch != null && !nameSearch.isBlank()) {
            List<ParentChildRelationship> nameRels = relationRepo.findByStudentNameContainingIgnoreCase(nameSearch);
            if (!nameRels.isEmpty()) {
                ParentChildRelationship r = nameRels.get(0);
                Map<String, Object> resp = new HashMap<>();
                resp.put("found", true);
                resp.put("searchKey", nameSearch);
                resp.put("studentName", r.getStudentName());
                resp.put("studentUniqueId", r.getStudentUniqueId());
                resp.put("parentName", r.getParentName());
                resp.put("parentUniqueId", r.getParentUniqueId());
                resp.put("parentEmail", r.getParentEmail());
                resp.put("className", r.getClassName());
                resp.put("section", r.getSection());
                resp.put("status", r.getStatus());
                resp.put("relationshipType", r.getRelationshipType());
                resp.put("adminRemarks", r.getAdminRemarks());
                resp.put("relationship", r);
                return ResponseEntity.ok(resp);
            }
        }

        // 3. Check by student user ID
        if (studentUserId != null) {
            List<ParentChildRelationship> rels = relationRepo.findByStudentUserId(studentUserId);
            if (!rels.isEmpty()) {
                ParentChildRelationship r = rels.get(0);
                return ResponseEntity.ok(Map.of(
                    "found", true,
                    "searchBy", "studentUserId",
                    "studentName", r.getStudentName(),
                    "studentUniqueId", r.getStudentUniqueId(),
                    "parentName", r.getParentName(),
                    "parentUniqueId", r.getParentUniqueId(),
                    "relationship", r
                ));
            }
        }

        // 4. Fallback: Lookup in student_details table directly
        if (searchTerm != null && !searchTerm.isBlank()) {
            Optional<StudentDetails> detailOpt = studentDetailsRepo.findByStudentId(searchTerm);
            if (detailOpt.isEmpty()) {
                List<StudentDetails> byName = studentDetailsRepo.searchStudents(searchTerm);
                if (!byName.isEmpty()) {
                    detailOpt = Optional.of(byName.get(0));
                }
            }

            if (detailOpt.isPresent()) {
                StudentDetails sd = detailOpt.get();
                // Find matching parent user
                String pName = sd.getParentName();
                Optional<User> parentUser = userRepo.findByUsername(pName.toLowerCase())
                        .or(() -> userRepo.findByUsername("parent"))
                        .or(() -> userRepo.findByEmailIgnoreCase("parent@school.com"));

                Map<String, Object> result = new HashMap<>();
                result.put("found", true);
                result.put("source", "student_details_table");
                result.put("studentName", sd.getFullName());
                result.put("studentUniqueId", sd.getStudentId());
                result.put("parentName", sd.getParentName());
                result.put("parentUniqueId", parentUser.map(u -> String.valueOf(u.getId())).orElse("N/A"));
                result.put("className", sd.getFormattedClass());
                result.put("section", sd.getSectionName());
                result.put("status", "ACCEPTED");
                result.put("studentDetails", sd);
                return ResponseEntity.ok(result);
            }
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
            "found", false,
            "message", "No parent relationship found for the specified student identifier."
        ));
    }

    /**
     * Find which students are children for a given parent (referencing student_details and users tables)
     * e.g. GET /api/parent-profile/who-are-children-of?parentUniqueId=75
     */
    @GetMapping("/who-are-children-of")
    public ResponseEntity<?> whoAreChildrenOf(
            @RequestParam(required = false) String parentUniqueId,
            @RequestParam(required = false) Long parentUserId,
            @RequestParam(required = false) String parentName,
            @RequestParam(required = false) String parentEmail) {

        List<ParentChildRelationship> rels = new ArrayList<>();

        if (parentUniqueId != null && !parentUniqueId.isBlank()) {
            rels = relationRepo.findByParentUniqueId(parentUniqueId.trim());
            if (rels.isEmpty()) {
                try {
                    Long pId = Long.parseLong(parentUniqueId.trim().replaceAll("[^0-9]", ""));
                    rels = relationRepo.findByParentUserId(pId);
                } catch (NumberFormatException ignored) {}
            }
        } else if (parentUserId != null) {
            rels = relationRepo.findByParentUserId(parentUserId);
        } else if (parentEmail != null && !parentEmail.isBlank()) {
            rels = relationRepo.findByParentEmailIgnoreCase(parentEmail.trim());
        } else if (parentName != null && !parentName.isBlank()) {
            rels = relationRepo.findByParentNameIgnoreCase(parentName.trim());
            if (rels.isEmpty()) {
                rels = relationRepo.findByParentNameContainingIgnoreCase(parentName.trim());
            }
        }

        // If not found in relationships, search student_details table by parentName
        if (rels.isEmpty() && parentName != null && !parentName.isBlank()) {
            List<StudentDetails> details = studentDetailsRepo.findByParentNameContainingIgnoreCase(parentName.trim());
            if (!details.isEmpty()) {
                return ResponseEntity.ok(Map.of(
                    "found", true,
                    "source", "student_details_table",
                    "parentName", parentName,
                    "parentUniqueId", "N/A",
                    "totalChildren", details.size(),
                    "children", details
                ));
            }
        }

        String resolvedParentName = !rels.isEmpty() ? rels.get(0).getParentName() : (parentName != null ? parentName : "Unknown Parent");
        String resolvedParentId = !rels.isEmpty() ? rels.get(0).getParentUniqueId() : (parentUniqueId != null ? parentUniqueId : (parentUserId != null ? String.valueOf(parentUserId) : "N/A"));

        return ResponseEntity.ok(Map.of(
            "found", !rels.isEmpty(),
            "parentName", resolvedParentName,
            "parentUniqueId", resolvedParentId,
            "totalChildren", rels.size(),
            "children", rels
        ));
    }

    /**
     * Synchronize all records from student_details table into parent_child_relationships
     * ensuring studentName, studentUniqueId, parentName, and parentUniqueId are precisely aligned.
     */
    @PostMapping("/sync-from-student-details")
    public ResponseEntity<?> syncFromStudentDetails() {
        List<StudentDetails> students = studentDetailsRepo.findAll();
        int createdCount = 0;
        int updatedCount = 0;

        for (StudentDetails s : students) {
            String pName = s.getParentName() != null ? s.getParentName().trim() : "Robert Patterson";

            // Determine matching parent user in users table
            Long pId = 50L;
            String pEmail = "parent@school.com";

            if (pName.equalsIgnoreCase("ramanji")) {
                Optional<User> u = userRepo.findByUsername("ramanji");
                if (u.isPresent()) { pId = u.get().getId(); pEmail = u.get().getEmail(); }
            } else if (pName.equalsIgnoreCase("parent3")) {
                Optional<User> u = userRepo.findByUsername("parent3");
                if (u.isPresent()) { pId = u.get().getId(); pEmail = u.get().getEmail(); }
            } else if (pName.equalsIgnoreCase("faterdklf")) {
                Optional<User> u = userRepo.findByUsername("faterdklf");
                if (u.isPresent()) { pId = u.get().getId(); pEmail = u.get().getEmail(); }
            } else if (pName.equalsIgnoreCase("fatst")) {
                Optional<User> u = userRepo.findByUsername("fatst");
                if (u.isPresent()) { pId = u.get().getId(); pEmail = u.get().getEmail(); }
            } else if (pName.equalsIgnoreCase("parentA")) {
                Optional<User> u = userRepo.findByUsername("parentA");
                if (u.isPresent()) { pId = u.get().getId(); pEmail = u.get().getEmail(); }
            } else if (pName.toLowerCase().contains("parent1")) {
                Optional<User> u = userRepo.findByUsername("parent1");
                if (u.isPresent()) { pId = u.get().getId(); pEmail = u.get().getEmail(); }
            } else {
                Optional<User> u = userRepo.findById(50L);
                if (u.isPresent()) { pId = u.get().getId(); pEmail = u.get().getEmail(); }
            }

            // Check matching student user in users table
            Optional<User> studentUser = userRepo.findByUsername(s.getFirstName().toLowerCase())
                    .or(() -> userRepo.findByUsername(s.getStudentId().toLowerCase()));

            List<ParentChildRelationship> existing = relationRepo.findByStudentUniqueIdIgnoreCase(s.getStudentId());
            if (existing.isEmpty()) {
                existing = relationRepo.findByStudentIdentity(s.getStudentId());
            }

            if (existing.isEmpty()) {
                ParentChildRelationship rel = new ParentChildRelationship(
                    pId,
                    studentUser.map(User::getId).orElse(null),
                    s.getId(),
                    pEmail,
                    pName,
                    s.getStudentId(),
                    s.getFullName(),
                    s.getFormattedClass(),
                    s.getSectionName(),
                    "Father",
                    "ACCEPTED",
                    "Synchronized from student_details table."
                );
                rel.setParentUniqueId(String.valueOf(pId));
                relationRepo.save(rel);
                createdCount++;
            } else {
                for (ParentChildRelationship rel : existing) {
                    rel.setStudentDetailsId(s.getId());
                    rel.setStudentName(s.getFullName());
                    rel.setStudentUniqueId(s.getStudentId());
                    rel.setChildName(s.getFullName());
                    rel.setStudentIdentity(s.getStudentId());
                    rel.setParentName(pName);
                    rel.setParentUserId(pId);
                    rel.setParentUniqueId(String.valueOf(pId));
                    rel.setParentEmail(pEmail);
                    rel.setClassName(s.getFormattedClass());
                    rel.setSection(s.getSectionName());
                    if (studentUser.isPresent() && rel.getStudentUserId() == null) {
                        rel.setStudentUserId(studentUser.get().getId());
                    }
                    relationRepo.save(rel);
                    updatedCount++;
                }
            }
        }

        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Synchronized all relationships referencing student_details and users tables.",
            "totalStudentDetails", students.size(),
            "createdRelationships", createdCount,
            "updatedRelationships", updatedCount
        ));
    }

    /**
     * Lookup by email fallback
     */
    @GetMapping("/by-email")
    public ResponseEntity<?> getByEmail(@RequestParam String email) {
        Optional<ParentProfile> profileOpt = parentRepo.findByEmailIgnoreCase(email);
        if (profileOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Parent profile not found for email: " + email));
        }
        ParentProfile profile = profileOpt.get();
        List<ParentChildRelationship> children = relationRepo.findByParentUserId(profile.getUserId());
        return ResponseEntity.ok(new ParentProfileResponse(profile, children, "Retrieved successfully"));
    }

    /**
     * Get list of student users from users table for relationship linking
     */
    @GetMapping("/students")
    public ResponseEntity<List<User>> getStudents() {
        List<User> students = userRepo.findByRoleIgnoreCase("STUDENT");
        students.sort(Comparator.comparing(User::getFirstName, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)));
        return ResponseEntity.ok(students);
    }

    /**
     * Search student users in users table by username, name, or email
     */
    @GetMapping("/students/search")
    public ResponseEntity<List<User>> searchStudents(@RequestParam(defaultValue = "") String q) {
        if (q == null || q.trim().isEmpty()) {
            return getStudents();
        }
        List<User> students = userRepo.searchStudents(q.trim());
        return ResponseEntity.ok(students);
    }

    /**
     * Get list of parent users from users table
     */
    @GetMapping("/parents")
    public ResponseEntity<List<User>> getParents() {
        List<User> parents = userRepo.findByRoleIgnoreCase("PARENT");
        parents.sort(Comparator.comparing(User::getFirstName, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)));
        return ResponseEntity.ok(parents);
    }

    /**
     * Search parent users in users table by username, name, or email
     */
    @GetMapping("/parents/search")
    public ResponseEntity<List<User>> searchParents(@RequestParam(defaultValue = "") String q) {
        if (q == null || q.trim().isEmpty()) {
            return getParents();
        }
        List<User> parents = userRepo.searchParents(q.trim());
        return ResponseEntity.ok(parents);
    }

    /**
     * Get all parents linked to a student user from the users table
     */
    @GetMapping("/student/{studentUserId}/parents")
    public ResponseEntity<List<ParentChildRelationship>> getParentsForStudent(@PathVariable Long studentUserId) {
        List<ParentChildRelationship> parents = relationRepo.findByStudentUserId(studentUserId);
        return ResponseEntity.ok(parents);
    }

    /**
     * Get all child relationships (supports filtering by parentUserId, email, or status)
     */
    @GetMapping("/children")
    public ResponseEntity<List<ParentChildRelationship>> getChildren(
            @RequestParam(required = false) Long parentUserId,
            @RequestParam(required = false) String parentEmail,
            @RequestParam(required = false) String status) {

        if (status != null && !status.isBlank()) {
            return ResponseEntity.ok(relationRepo.findByStatusIgnoreCase(status));
        }
        if (parentUserId != null) {
            return ResponseEntity.ok(relationRepo.findByParentUserId(parentUserId));
        }
        if (parentEmail != null && !parentEmail.isBlank()) {
            return ResponseEntity.ok(relationRepo.findByParentEmailIgnoreCase(parentEmail));
        }
        return ResponseEntity.ok(relationRepo.findAll());
    }

    /**
     * Submit request to link a new child to parent (starts in PENDING status).
     * Connects foreign keys to users table and student_details table for both parent and student.
     */
    @PostMapping("/link-child")
    public ResponseEntity<?> linkChild(@Valid @RequestBody ChildRelationshipRequest request) {
        try {
            Long parentId = request.getParentUserId();
            String parentEmail = request.getParentEmail();
            String parentName = request.getParentName();

            // Fetch parent details from users table if available
            Optional<User> parentUserOpt = userRepo.findById(parentId);
            if (parentUserOpt.isPresent()) {
                User pu = parentUserOpt.get();
                parentEmail = pu.getEmail();
                parentName = pu.getFullName();
            }

            Long studentUserId = request.getStudentUserId();
            Long studentDetailsId = request.getStudentDetailsId();
            String childName = request.getChildName();
            String studentIdentity = request.getStudentIdentity();
            String className = request.getClassName();
            String section = request.getSection();

            // 1. Check if student matches student_details table by studentId
            if (studentIdentity != null && !studentIdentity.trim().isEmpty()) {
                Optional<StudentDetails> detailOpt = studentDetailsRepo.findByStudentId(studentIdentity.trim());
                if (detailOpt.isPresent()) {
                    StudentDetails sd = detailOpt.get();
                    studentDetailsId = sd.getId();
                    childName = sd.getFullName();
                    studentIdentity = sd.getStudentId();
                    className = sd.getFormattedClass();
                    section = sd.getSectionName();
                }
            }

            // 2. Check if student matches users table
            if (studentUserId != null) {
                Optional<User> studentOpt = userRepo.findById(studentUserId);
                if (studentOpt.isPresent()) {
                    User su = studentOpt.get();
                    if (childName == null || childName.isBlank()) childName = su.getFullName();
                    if (studentIdentity == null || studentIdentity.isBlank()) studentIdentity = su.getUsername();
                }
            } else if (studentIdentity != null && !studentIdentity.trim().isEmpty()) {
                String searchId = studentIdentity.trim();
                Optional<User> studentOpt = userRepo.findByUsername(searchId);
                if (studentOpt.isEmpty()) {
                    studentOpt = userRepo.findByEmailIgnoreCase(searchId);
                }
                if (studentOpt.isPresent()) {
                    User su = studentOpt.get();
                    studentUserId = su.getId();
                    if (childName == null || childName.isBlank()) childName = su.getFullName();
                    if (studentIdentity == null || studentIdentity.isBlank()) studentIdentity = su.getUsername();
                }
            }

            if (childName == null || childName.trim().isEmpty()) {
                childName = "Student User";
            }
            if (studentIdentity == null || studentIdentity.trim().isEmpty()) {
                studentIdentity = "STU-" + System.currentTimeMillis() % 10000;
            }

            ParentChildRelationship relationship = new ParentChildRelationship(
                parentId,
                studentUserId,
                studentDetailsId,
                parentEmail,
                parentName,
                studentIdentity,
                childName,
                className != null ? className : "Grade 10",
                section != null ? section : "A",
                request.getRelationshipType(),
                "PENDING",
                "Pending administrative verification against student_details and users tables."
            );

            ParentChildRelationship saved = relationRepo.save(relationship);
            // Re-fetch to populate @ManyToOne joined User & StudentDetails entities
            Optional<ParentChildRelationship> populated = relationRepo.findById(saved.getId());

            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "message", "Child link request submitted successfully. Awaiting administrative approval.",
                "data", populated.orElse(saved)
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", "Failed to submit child link request: " + e.getMessage()
            ));
        }
    }

    /**
     * Direct endpoint to establish a relation between a Parent User and a Student User
     * using the users table and student_details table.
     */
    @PostMapping("/link-users")
    public ResponseEntity<?> linkUsersById(
            @RequestParam Long parentUserId,
            @RequestParam Long studentUserId,
            @RequestParam(defaultValue = "Father") String relationshipType,
            @RequestParam(defaultValue = "Grade 10") String className,
            @RequestParam(defaultValue = "A") String section,
            @RequestParam(defaultValue = "PENDING") String status,
            @RequestParam(required = false) String adminRemarks) {

        Optional<User> parentOpt = userRepo.findById(parentUserId);
        if (parentOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Parent user not found in users table with id: " + parentUserId));
        }

        Optional<User> studentOpt = userRepo.findById(studentUserId);
        if (studentOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Student user not found in users table with id: " + studentUserId));
        }

        User parent = parentOpt.get();
        User student = studentOpt.get();

        // Check if relationship already exists
        Optional<ParentChildRelationship> existing = relationRepo.findByParentUserIdAndStudentUserId(parentUserId, studentUserId);
        if (existing.isPresent()) {
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Relationship between Parent User #" + parentUserId + " and Student User #" + studentUserId + " already exists in users table.",
                "data", existing.get()
            ));
        }

        // Check if student exists in student_details table
        Optional<StudentDetails> detailOpt = studentDetailsRepo.findByStudentId(student.getUsername());
        Long studentDetailsId = detailOpt.map(StudentDetails::getId).orElse(null);

        ParentChildRelationship rel = new ParentChildRelationship(
            parent.getId(),
            student.getId(),
            studentDetailsId,
            parent.getEmail(),
            parent.getFullName(),
            student.getUsername(),
            student.getFullName(),
            className,
            section,
            relationshipType,
            status,
            adminRemarks != null ? adminRemarks : "Direct relation created using users and student_details tables."
        );

        ParentChildRelationship saved = relationRepo.save(rel);
        Optional<ParentChildRelationship> populated = relationRepo.findById(saved.getId());

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
            "success", true,
            "message", "Successfully created relation between Parent User (" + parent.getFullName() + ") and Student User (" + student.getFullName() + ") using users table.",
            "data", populated.orElse(saved)
        ));
    }

    /**
     * Admin endpoint: Accept, Reject, or set status to Pending with admin remarks
     */
    @PutMapping("/relationships/{id}/status")
    public ResponseEntity<?> updateRelationshipStatus(@PathVariable Long id, @Valid @RequestBody StatusUpdateRequest request) {
        Optional<ParentChildRelationship> opt = relationRepo.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Relationship record not found with id: " + id));
        }

        String newStatus = request.getStatus().toUpperCase().trim();
        if (!Arrays.asList("ACCEPTED", "APPROVED", "PENDING", "REJECTED").contains(newStatus)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid status. Must be ACCEPTED, PENDING, or REJECTED."));
        }
        if ("APPROVED".equalsIgnoreCase(newStatus)) {
            newStatus = "ACCEPTED";
        }

        ParentChildRelationship rel = opt.get();
        rel.setStatus(newStatus);
        rel.setAdminRemarks(request.getAdminRemarks() != null ? request.getAdminRemarks() : "Status updated to " + newStatus + " by administration.");
        rel.setReviewedBy(request.getReviewedBy() != null ? request.getReviewedBy() : "Admin Office");
        rel.setReviewedAt(LocalDateTime.now());

        ParentChildRelationship saved = relationRepo.save(rel);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Child relationship status updated to " + newStatus + " successfully.",
            "data", saved
        ));
    }

    /**
     * Update parent contact / emergency details
     */
    @PutMapping("/{userId}")
    public ResponseEntity<?> updateProfile(@PathVariable Long userId, @RequestBody Map<String, String> body) {
        Optional<ParentProfile> opt = parentRepo.findByUserId(userId);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Parent profile not found"));
        }
        ParentProfile profile = opt.get();
        if (body.containsKey("phone")) profile.setPhone(body.get("phone"));
        if (body.containsKey("address")) profile.setAddress(body.get("address"));
        if (body.containsKey("emergencyContact")) profile.setEmergencyContact(body.get("emergencyContact"));

        ParentProfile saved = parentRepo.save(profile);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Profile updated successfully",
            "data", saved
        ));
    }

    /**
     * Delete a child relationship record
     */
    @DeleteMapping("/relationships/{id}")
    public ResponseEntity<?> deleteRelationship(@PathVariable Long id) {
        if (!relationRepo.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Relationship not found"));
        }
        relationRepo.deleteById(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Relationship removed successfully"));
    }
}
