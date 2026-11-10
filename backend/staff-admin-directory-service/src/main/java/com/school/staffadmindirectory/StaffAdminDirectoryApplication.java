package com.school.staffadmindirectory;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class StaffAdminDirectoryApplication {

    public static void main(String[] args) {
        SpringApplication.run(StaffAdminDirectoryApplication.class, args);
    }
}

