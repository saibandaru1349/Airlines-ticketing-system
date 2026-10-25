package com.airline.ticketing.dto;

import com.airline.ticketing.entity.SeatClass;
import com.airline.ticketing.entity.SeatStatus;
import java.math.BigDecimal;

public record SeatResponse(String seatNumber, SeatClass seatClass, SeatStatus status, BigDecimal price) { }
