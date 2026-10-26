package com.school.parentprofile.config;

import com.school.parentprofile.entity.ParentChildRelationship;
import com.school.parentprofile.entity.ParentProfile;
import com.school.parentprofile.entity.StudentDetails;
import com.school.parentprofile.entity.User;
import com.school.parentprofile.repository.ParentChildRelationshipRepository;
import com.school.parentprofile.repository.ParentProfileRepository;
import com.school.parentprofile.repository.StudentDetailsRepository;
import com.school.parentprofile.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Component
public class DataInitializer implements CommandLineRunner {

    private final ParentProfileRepository parentRepo;
    private final ParentChildRelationshipRepository relationRepo;
    private final UserRepository userRepo;
    private final StudentDetailsRepository studentDetailsRepo;

    public DataInitializer(
            ParentProfileRepository parentRepo,
            ParentChildRelationshipRepository relationRepo,
            UserRepository userRepo,
            StudentDetailsRepository studentDetailsRepo) {
        this.parentRepo = parentRepo;
        this.relationRepo = relationRepo;
        this.userRepo = userRepo;
        this.studentDetailsRepo = studentDetailsRepo;
    }

    @Override
    public void run(String... args) throws Exception {
        // 1. Ensure Parent User exists in users table (ID 50 or username 'parent')
        User parentUser = userRepo.findById(50L).orElseGet(() -> {
            return userRepo.findByUsername("parent").orElseGet(() -> {
                User created = new User("Robert", "Patterson", "parent", "parent@school.com", "PARENT", "$2a$10$wNqvVv39e3d8z9eJ7q8tge2h0UqP99bS8u6r5VvO3vR4A7m1oGZ5i");
                return userRepo.save(created);
            });
        });

        // 2. Ensure Parent Profile exists
        if (!parentRepo.existsByUserId(parentUser.getId())) {
            ParentProfile profile = new ParentProfile(
                parentUser.getId(),
                parentUser.getUsername(),
                parentUser.getFirstName(),
                parentUser.getLastName(),
                parentUser.getEmail(),
                "PARENT",
                "+1 (555) 349-8201",
                "742 Evergreen Terrace, Springfield",
                "Eleanor Patterson (+1 555-349-8202)",
                "Active & Verified"
            );
            parentRepo.save(profile);
        }

        // 3. Ensure Student Users exist in users table
        User lucas = getOrCreateStudent("Lucas", "Patterson", "lucas", "lucas.patterson@school.com");
        User sophia = getOrCreateStudent("Sophia", "Patterson", "sophia", "sophia.patterson@school.com");
        User ethan = getOrCreateStudent("Ethan", "Patterson", "ethan", "ethan.patterson@school.com");

        // 4. Ensure Student Details exist in student_details table
        StudentDetails lucasDetails = getOrCreateStudentDetail("ADM-1042", "Lucas", "Patterson", "Robert Patterson", 10, "A");
        StudentDetails sophiaDetails = getOrCreateStudentDetail("ADM-2089", "Sophia", "Patterson", "Robert Patterson", 7, "B");
        StudentDetails ethanDetails = getOrCreateStudentDetail("ADM-3150", "Ethan", "Patterson", "Robert Patterson", 4, "C");

        // 5. Ensure relationship records exist linking parent user and student_details table
        List<ParentChildRelationship> existing = relationRepo.findByParentUserId(parentUser.getId());
        if (existing.isEmpty()) {
            // Lucas - ACCEPTED
            ParentChildRelationship child1 = new ParentChildRelationship(
                parentUser.getId(),
                lucas.getId(),
                lucasDetails.getId(),
                parentUser.getEmail(),
                parentUser.getFullName(),
                lucasDetails.getStudentId(),
                lucasDetails.getFullName(),
                lucasDetails.getFormattedClass(),
                lucasDetails.getSectionName(),
                "Father",
                "ACCEPTED",
                "Verified via birth registration and official transfer certificate."
            );
            child1.setReviewedBy("Super Admin");
            child1.setReviewedAt(LocalDateTime.now().minusDays(2));
            relationRepo.save(child1);

            // Sophia - PENDING
            ParentChildRelationship child2 = new ParentChildRelationship(
                parentUser.getId(),
                sophia.getId(),
                sophiaDetails.getId(),
                parentUser.getEmail(),
                parentUser.getFullName(),
                sophiaDetails.getStudentId(),
                sophiaDetails.getFullName(),
                sophiaDetails.getFormattedClass(),
                sophiaDetails.getSectionName(),
                "Father",
                "PENDING",
                "Awaiting physical verification of parental guardianship certificate."
            );
            relationRepo.save(child2);

            // Ethan - REJECTED
            ParentChildRelationship child3 = new ParentChildRelationship(
                parentUser.getId(),
                ethan.getId(),
                ethanDetails.getId(),
                parentUser.getEmail(),
                parentUser.getFullName(),
                ethanDetails.getStudentId(),
                ethanDetails.getFullName(),
                ethanDetails.getFormattedClass(),
                ethanDetails.getSectionName(),
                "Father",
                "REJECTED",
                "Student identity record not found in current enrollment cycle. Please resubmit valid student ID."
            );
            child3.setReviewedBy("Admission Desk");
            child3.setReviewedAt(LocalDateTime.now().minusDays(5));
            relationRepo.save(child3);
        } else {
            // Update existing relationships with student_details_id and student_user_id
            for (ParentChildRelationship rel : existing) {
                if (rel.getStudentDetailsId() == null) {
                    if (rel.getStudentIdentity() != null && rel.getStudentIdentity().contains("1042")) {
                        rel.setStudentDetailsId(lucasDetails.getId());
                        rel.setStudentIdentity(lucasDetails.getStudentId());
                        rel.setStudentUserId(lucas.getId());
                        relationRepo.save(rel);
                    } else if (rel.getStudentIdentity() != null && rel.getStudentIdentity().contains("2089")) {
                        rel.setStudentDetailsId(sophiaDetails.getId());
                        rel.setStudentIdentity(sophiaDetails.getStudentId());
                        rel.setStudentUserId(sophia.getId());
                        relationRepo.save(rel);
                    } else if (rel.getStudentIdentity() != null && rel.getStudentIdentity().contains("3150")) {
                        rel.setStudentDetailsId(ethanDetails.getId());
                        rel.setStudentIdentity(ethanDetails.getStudentId());
                        rel.setStudentUserId(ethan.getId());
                        relationRepo.save(rel);
                    }
                }
            }
        }
    }

    private User getOrCreateStudent(String firstName, String lastName, String username, String email) {
        return userRepo.findByUsername(username).orElseGet(() -> {
            return userRepo.findByEmailIgnoreCase(email).orElseGet(() -> {
                User student = new User(firstName, lastName, username, email, "STUDENT", "$2a$10$wNqvVv39e3d8z9eJ7q8tge2h0UqP99bS8u6r5VvO3vR4A7m1oGZ5i");
                return userRepo.save(student);
            });
        });
    }

    private StudentDetails getOrCreateStudentDetail(String studentId, String firstName, String lastName, String parentName, Integer classStandard, String sectionName) {
        return studentDetailsRepo.findByStudentId(studentId).orElseGet(() -> {
            StudentDetails detail = new StudentDetails(studentId, firstName, lastName, parentName, classStandard, sectionName);
            return studentDetailsRepo.save(detail);
        });
    }
}
