package com.airline.ticketing.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;

public record BookingRequest(
        @NotNull Long flightId,
        @NotEmpty @Size(max = 9, message = "at most 9 passengers per booking") List<@Valid PassengerRequest> passengers) { }
