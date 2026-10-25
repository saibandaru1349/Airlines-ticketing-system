package com.airline.ticketing.dto;

import com.airline.ticketing.entity.BookingStatus;
import com.airline.ticketing.entity.PaymentStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record BookingResponse(
        String pnr,
        BookingStatus status,
        String flightNumber,
        String source,
        String destination,
        LocalDateTime departureTime,
        BigDecimal totalAmount,
        LocalDateTime holdExpiresAt,
        Long holdSecondsRemaining,
        PaymentStatus paymentStatus,
        List<PassengerInfo> passengers) { }
