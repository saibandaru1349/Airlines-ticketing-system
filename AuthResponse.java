package com.airline.ticketing.dto;

public record AuthResponse(String token, String name, String email, String role) { }
