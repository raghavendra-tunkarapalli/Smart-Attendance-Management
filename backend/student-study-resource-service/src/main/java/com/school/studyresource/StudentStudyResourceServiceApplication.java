package com.school.studyresource;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class StudentStudyResourceServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(StudentStudyResourceServiceApplication.class, args);
    }
}
