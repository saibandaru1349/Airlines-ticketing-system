package com.airline.ticketing.dto;

import jakarta.validation.constraints.*;

public record AircraftRequest(
        @NotBlank String model,
        @Min(0) int economySeats,
        @Min(0) int businessSeats) { }
