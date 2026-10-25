package com.airline.ticketing.repository;

import com.airline.ticketing.entity.Airport;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AirportRepository extends JpaRepository<Airport, Long> {
    Optional<Airport> findByCode(String code);
    boolean existsByCode(String code);
}
