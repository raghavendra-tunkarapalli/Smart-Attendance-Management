package com.school.parentprofile;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class ParentProfileServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(ParentProfileServiceApplication.class, args);
    }
}
