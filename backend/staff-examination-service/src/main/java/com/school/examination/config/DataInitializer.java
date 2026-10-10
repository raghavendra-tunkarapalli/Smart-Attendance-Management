package com.school.examination.config;

import com.school.examination.entity.AssignmentQuestion;
import com.school.examination.entity.StudentAssignment;
import com.school.examination.repository.StudentAssignmentRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.ArrayList;
import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initExamData(StudentAssignmentRepository repository) {
        return args -> {
            if (repository.count() == 0) {
                List<StudentAssignment> exams = new ArrayList<>();

                // Exam 1: Class 10 - Section A - Mathematics Mid-Term Assessment
                StudentAssignment exam1 = new StudentAssignment(
                        "Mid-Term Mathematics Assessment 2026",
                        10,
                        "A",
                        "Mathematics",
                        "2026-10-15 09:30"
                );
                exam1.setResultsReleased(true);
                List<AssignmentQuestion> qList1 = new ArrayList<>();
                qList1.add(new AssignmentQuestion(1, "What is the discriminant of the quadratic equation 2x^2 - 4x + 3 = 0?", "8", "-8", "12", "0", "B"));
                qList1.add(new AssignmentQuestion(2, "The nth term of an Arithmetic Progression is given by an = 3 + 4n. What is the common difference?", "3", "7", "4", "12", "C"));
                qList1.add(new AssignmentQuestion(3, "If sin(theta) = 3/5, what is the value of tan(theta)?", "3/4", "4/3", "4/5", "5/3", "A"));
                qList1.add(new AssignmentQuestion(4, "The probability of getting a prime number when a die is thrown once is:", "1/6", "1/2", "1/3", "2/3", "B"));
                qList1.add(new AssignmentQuestion(5, "What is the sum of first 20 natural numbers?", "210", "200", "190", "420", "A"));
                exam1.setQuestions(qList1);
                exams.add(exam1);

                // Exam 2: Class 10 - Section B - Physics Mechanics & Optics Unit Test
                StudentAssignment exam2 = new StudentAssignment(
                        "Physics Mechanics & Wave Optics Unit Test",
                        10,
                        "B",
                        "Physics",
                        "2026-10-18 11:00"
                );
                exam2.setResultsReleased(true);
                List<AssignmentQuestion> qList2 = new ArrayList<>();
                qList2.add(new AssignmentQuestion(1, "The unit of electric power in SI system is:", "Joule", "Volt", "Watt", "Ampere", "C"));
                qList2.add(new AssignmentQuestion(2, "Which mirror is used by dentists to see large images of teeth?", "Convex mirror", "Concave mirror", "Plane mirror", "Cylindrical mirror", "B"));
                qList2.add(new AssignmentQuestion(3, "The resistance of a wire is directly proportional to its:", "Area of cross-section", "Length", "Current", "Potential difference", "B"));
                qList2.add(new AssignmentQuestion(4, "Refractive index of diamond with respect to air is approximately:", "1.33", "1.52", "2.42", "1.00", "C"));
                exam2.setQuestions(qList2);
                exams.add(exam2);

                // Exam 3: Class 9 - Section A - Computer Science & Python Programming
                StudentAssignment exam3 = new StudentAssignment(
                        "Computer Science Fundamentals & Python Programming",
                        9,
                        "A",
                        "Computer Science",
                        "2026-10-20 14:00"
                );
                exam3.setResultsReleased(false);
                List<AssignmentQuestion> qList3 = new ArrayList<>();
                qList3.add(new AssignmentQuestion(1, "Which data type is immutable in Python?", "List", "Dictionary", "Tuple", "Set", "C"));
                qList3.add(new AssignmentQuestion(2, "What is the time complexity of searching an element in a balanced Binary Search Tree?", "O(1)", "O(log n)", "O(n)", "O(n log n)", "B"));
                qList3.add(new AssignmentQuestion(3, "Which keyword is used to define a function in Python?", "func", "function", "def", "lambda", "C"));
                qList3.add(new AssignmentQuestion(4, "What is the primary protocol used to transfer web pages securely across the Internet?", "FTP", "HTTP", "HTTPS", "SMTP", "C"));
                exam3.setQuestions(qList3);
                exams.add(exam3);

                // Exam 4: Class 12 - Section A - Organic Chemistry & Chemical Kinetics
                StudentAssignment exam4 = new StudentAssignment(
                        "Chemistry Diagnostic Exam: Organic & Kinetics",
                        12,
                        "A",
                        "Chemistry",
                        "2026-10-22 10:00"
                );
                exam4.setResultsReleased(true);
                List<AssignmentQuestion> qList4 = new ArrayList<>();
                qList4.add(new AssignmentQuestion(1, "The order of a reaction whose rate constant has units mol L^-1 s^-1 is:", "Zero order", "First order", "Second order", "Pseudo first order", "A"));
                qList4.add(new AssignmentQuestion(2, "Which functional group is present in aldehydes?", "-COOH", "-CHO", "-OH", "-CO-", "B"));
                qList4.add(new AssignmentQuestion(3, "What is the IUPAC name of acetic acid?", "Methanoic acid", "Ethanoic acid", "Propanoic acid", "Butanoic acid", "B"));
                qList4.add(new AssignmentQuestion(4, "Which catalyst is used in Haber process for ammonia synthesis?", "Nickel", "Platinum", "Finely divided Iron", "Vanadium pentoxide", "C"));
                exam4.setQuestions(qList4);
                exams.add(exam4);

                // Exam 5: Class 8 - Section C - English Literature & Grammar Assessment
                StudentAssignment exam5 = new StudentAssignment(
                        "English Literature & Analytical Grammar Assessment",
                        8,
                        "C",
                        "English",
                        "2026-10-25 09:00"
                );
                exam5.setResultsReleased(false);
                List<AssignmentQuestion> qList5 = new ArrayList<>();
                qList5.add(new AssignmentQuestion(1, "Identify the figure of speech in: 'The wind whispered through the dark trees.'", "Metaphor", "Simile", "Personification", "Hyperbole", "C"));
                qList5.add(new AssignmentQuestion(2, "Choose the correctly punctuated sentence:", "Its a nice day, isnt it?", "It's a nice day, isn't it?", "Its' a nice day, isn't it?", "It is a nice day isn't it", "B"));
                qList5.add(new AssignmentQuestion(3, "What is the antonym of the word 'Abundant'?", "Plentiful", "Scarce", "Ample", "Copious", "B"));
                exam5.setQuestions(qList5);
                exams.add(exam5);

                for (StudentAssignment exam : exams) {
                    repository.save(exam);
                }
                System.out.println("[StaffExaminationService] Initialized " + exams.size() + " sample examination records with MCQs.");
            }
        };
    }
}
