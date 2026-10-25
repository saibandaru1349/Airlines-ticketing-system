package com.airline.ticketing.dto;

import com.airline.ticketing.entity.SeatClass;

public record PassengerInfo(String name, int age, String gender, String seatNumber, SeatClass seatClass) { }
