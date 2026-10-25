package com.airline.ticketing.config;

import com.airline.ticketing.dto.*;
import com.airline.ticketing.entity.*;
import com.airline.ticketing.repository.*;
import com.airline.ticketing.service.AdminService;
import com.airline.ticketing.service.FlightService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/** Seeds an admin account and (optionally) demo airports, aircraft and flights on first start. */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepo;
    private final AirportRepository airportRepo;
    private final PasswordEncoder passwordEncoder;
    private final AdminService adminService;
    private final FlightService flightService;

    @Value("${app.admin.email}") private String adminEmail;
    @Value("${app.admin.password}") private String adminPassword;
    @Value("${app.seed-demo:true}") private boolean seedDemo;

    @Override
    public void run(String... args) {
        if (!userRepo.existsByEmail(adminEmail)) {
            userRepo.save(User.builder().name("Admin").email(adminEmail)
                    .password(passwordEncoder.encode(adminPassword)).role(Role.ADMIN).build());
            log.info("Created admin account: {}", adminEmail);
        }
        if (seedDemo && airportRepo.count() == 0) {
            adminService.createAirport(new AirportRequest("HYD", "Rajiv Gandhi International", "Hyderabad"));
            adminService.createAirport(new AirportRequest("BLR", "Kempegowda International", "Bengaluru"));
            adminService.createAirport(new AirportRequest("DEL", "Indira Gandhi International", "Delhi"));
            adminService.createAirport(new AirportRequest("BOM", "Chhatrapati Shivaji Maharaj International", "Mumbai"));
            Aircraft a320 = adminService.createAircraft(new AircraftRequest("Airbus A320", 150, 12));
            Aircraft atr = adminService.createAircraft(new AircraftRequest("ATR 72", 66, 0));

            LocalDate d = LocalDate.now().plusDays(7);
            flight("AI-101", "HYD", "BLR", a320, d.atTime(9, 0), 75, "4500");
            flight("AI-102", "BLR", "HYD", a320, d.atTime(18, 30), 75, "4300");
            flight("AI-201", "HYD", "DEL", a320, d.atTime(7, 15), 140, "6200");
            flight("AI-301", "DEL", "BOM", atr, d.atTime(12, 0), 130, "5100");
            log.info("Seeded demo airports, aircraft and flights for {}", d);
        }
    }

    private void flight(String no, String from, String to, Aircraft ac,
                        LocalDateTime dep, int minutes, String price) {
        flightService.createFlight(new FlightRequest(no, from, to, ac.getId(),
                dep, dep.plusMinutes(minutes), new BigDecimal(price)));
    }
}
