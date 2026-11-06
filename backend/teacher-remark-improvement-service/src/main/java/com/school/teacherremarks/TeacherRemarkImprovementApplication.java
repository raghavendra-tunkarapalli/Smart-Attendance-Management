package com.school.teacherremarks;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class TeacherRemarkImprovementApplication {

    public static void main(String[] args) {
        SpringApplication.run(TeacherRemarkImprovementApplication.class, args);
    }
}

