package com.airline.ticketing.repository;

import com.airline.ticketing.entity.Aircraft;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AircraftRepository extends JpaRepository<Aircraft, Long> { }
