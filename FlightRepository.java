package com.airline.ticketing.repository;

import com.airline.ticketing.entity.Flight;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;

public interface FlightRepository extends JpaRepository<Flight, Long> {

    @EntityGraph(attributePaths = {"source", "destination"})
    @Query("""
           SELECT f FROM Flight f
           WHERE f.source.code = :from
             AND f.destination.code = :to
             AND f.departureTime >= :start
             AND f.departureTime < :end
             AND f.departureTime > :now
           """)
    Page<Flight> search(@Param("from") String from,
                        @Param("to") String to,
                        @Param("start") LocalDateTime start,
                        @Param("end") LocalDateTime end,
                        @Param("now") LocalDateTime now,
                        Pageable pageable);
}
