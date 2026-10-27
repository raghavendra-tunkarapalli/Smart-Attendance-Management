package com.school.parentchildacademic;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class ParentChildAcademicServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(ParentChildAcademicServiceApplication.class, args);
    }
}
