package com.airline.ticketing.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record FlightRequest(
        @NotBlank String flightNumber,
        @NotBlank String sourceCode,
        @NotBlank String destinationCode,
        @NotNull Long aircraftId,
        @NotNull @Future LocalDateTime departureTime,
        @NotNull @Future LocalDateTime arrivalTime,
        @NotNull @Positive BigDecimal basePrice) { }
