package com.school.lessonnotes;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class TeacherLessonNotesServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(TeacherLessonNotesServiceApplication.class, args);
    }
}
