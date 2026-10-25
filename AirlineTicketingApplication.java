package com.airline.ticketing;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class AirlineTicketingApplication {
    public static void main(String[] args) {
        SpringApplication.run(AirlineTicketingApplication.class, args);
    }
}
