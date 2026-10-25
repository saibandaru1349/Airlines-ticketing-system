package com.airline.ticketing.dto;

import jakarta.validation.constraints.*;

public record AirportRequest(
        @NotBlank @Size(min = 3, max = 3, message = "must be a 3-letter code") String code,
        @NotBlank String name,
        @NotBlank String city) { }
