package com.school.studentfee;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class StudentFeePaymentServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(StudentFeePaymentServiceApplication.class, args);
    }
}

