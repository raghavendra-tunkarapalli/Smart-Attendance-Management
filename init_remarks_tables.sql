USE `school_management_system`;

CREATE TABLE IF NOT EXISTS `teacher_student_remarks` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `teacher_username` VARCHAR(150) NOT NULL,
  `teacher_name` VARCHAR(255) NOT NULL,
  `teacher_email` VARCHAR(255) NULL,
  `student_id` VARCHAR(100) NOT NULL,
  `student_name` VARCHAR(255) NOT NULL,
  `class_standard` VARCHAR(100) NOT NULL,
  `section` VARCHAR(50) NOT NULL,
  `parent_username` VARCHAR(150) NULL,
  `parent_name` VARCHAR(255) NULL,
  `parent_phone` VARCHAR(50) NULL,
  `subject` VARCHAR(100) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` LONGTEXT NOT NULL,
  `improvement_suggestions` LONGTEXT NOT NULL,
  `severity` VARCHAR(50) NOT NULL DEFAULT 'ATTENTION_NEEDED',
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  `acknowledged` BOOLEAN NOT NULL DEFAULT FALSE,
  `acknowledged_at` DATETIME NULL,
  `acknowledged_by` VARCHAR(255) NULL,
  `parent_feedback` TEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `remark_acknowledgments` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `remark_id` BIGINT NOT NULL,
  `student_id` VARCHAR(100) NOT NULL,
  `parent_username` VARCHAR(150) NOT NULL,
  `parent_name` VARCHAR(255) NOT NULL,
  `parent_notes` TEXT NULL,
  `acknowledged_at` DATETIME NOT NULL,
  `action_status` VARCHAR(50) NOT NULL DEFAULT 'CONFIRMED',
  INDEX `idx_remark_id` (`remark_id`),
  INDEX `idx_parent_username` (`parent_username`),
  INDEX `idx_student_id` (`student_id`),
  CONSTRAINT `fk_remark_ack` FOREIGN KEY (`remark_id`) REFERENCES `teacher_student_remarks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Initial Seed Data
INSERT INTO `teacher_student_remarks` 
(`id`, `teacher_username`, `teacher_name`, `teacher_email`, `student_id`, `student_name`, `class_standard`, `section`, `parent_username`, `parent_name`, `parent_phone`, `subject`, `category`, `title`, `description`, `improvement_suggestions`, `severity`, `created_at`, `updated_at`, `acknowledged`, `acknowledged_at`, `acknowledged_by`, `parent_feedback`)
VALUES
(1, 'teacher', 'Robert Vance', 'teacher@school.com', 'ADM-78578', 'Alex Morgan', 'Grade 10', 'A', 'parent', 'Robert Patterson', '+1 (555) 234-5678', 'Mathematics', 'ACADEMIC_PROGRESS', 'Significant Growth in Algebra & Quadratic Concepts', 'Alex has demonstrated consistent effort in solving quadratic equations and polynomial factorization during our weekly assessments. His analytical approach to complex equations has improved remarkably.', 'Encourage Alex to continue practicing 20 minutes daily on word problems to solidify real-world application.', 'PRAISE', '2026-11-03 10:15:00', '2026-11-03 10:15:00', 1, '2026-11-03 16:45:12', 'Robert Patterson', 'Thank you Mr. Vance. We are reviewing his practice sheets every evening and appreciate the positive reinforcement!'),
(2, 'teacher', 'Robert Vance', 'teacher@school.com', 'ADM-78578', 'Alex Morgan', 'Grade 10', 'A', 'parent', 'Robert Patterson', '+1 (555) 234-5678', 'Physics', 'CONCEPTUAL_UNDERSTANDING', 'Physics Lab Record Book & Practical Analysis', 'Alex excels in theoretical derivations but needs to complete his optics lab diagram workbook before the upcoming mid-term audit. Two practical experiment logs are pending.', 'Please review chapter 4 ray optics diagrams and ensure the experiment observation table is signed and submitted by Monday.', 'ATTENTION_NEEDED', '2026-11-04 09:30:00', '2026-11-04 09:30:00', 0, NULL, NULL, NULL),
(3, 'teacher', 'Robert Vance', 'teacher@school.com', 'ADM-70062', 'student1', 'Grade 1', 'A', 'parent1', 'parent1 parent1', '+1 (555) 345-6789', 'Mathematics', 'HOMEWORK_ASSIGNMENTS', 'Daily Counting & Number Pattern Completion', 'The student needs slightly more practice with two-digit addition carrying patterns. Speed is good but accuracy can be strengthened with visual counters.', 'Work on numbers 1-50 visual grid flashcards for 10 minutes before bedtime.', 'ATTENTION_NEEDED', '2026-11-04 11:00:00', '2026-11-04 11:00:00', 0, NULL, NULL, NULL)
ON DUPLICATE KEY UPDATE `id`=`id`;

INSERT INTO `remark_acknowledgments`
(`id`, `remark_id`, `student_id`, `parent_username`, `parent_name`, `parent_notes`, `acknowledged_at`, `action_status`)
VALUES
(1, 1, 'ADM-78578', 'parent', 'Robert Patterson', 'Thank you Mr. Vance. We are reviewing his practice sheets every evening and appreciate the positive reinforcement!', '2026-11-03 16:45:12', 'CONFIRMED')
ON DUPLICATE KEY UPDATE `id`=`id`;

