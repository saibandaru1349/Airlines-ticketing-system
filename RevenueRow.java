package com.airline.ticketing.dto;

import java.math.BigDecimal;

public record RevenueRow(String flightNumber, long confirmedBookings, BigDecimal revenue) { }
