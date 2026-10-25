package com.airline.ticketing.exception;

public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) { super(message); }
}
