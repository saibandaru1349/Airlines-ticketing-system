package com.airline.ticketing.dto;

import jakarta.validation.constraints.*;

public record PassengerRequest(
        @NotBlank String name,
        @Min(0) @Max(120) int age,
        @NotBlank String gender,
        @NotBlank String seatNumber) { }
