package com.airline.ticketing.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record FlightResponse(
        Long id,
        String flightNumber,
        String source,
        String destination,
        LocalDateTime departureTime,
        LocalDateTime arrivalTime,
        BigDecimal basePrice,
        long availableSeats) { }
