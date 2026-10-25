package com.airline.ticketing.repository;

import com.airline.ticketing.entity.Seat;
import com.airline.ticketing.entity.SeatStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SeatRepository extends JpaRepository<Seat, Long> {
    List<Seat> findByFlightIdOrderByIdAsc(Long flightId);
    List<Seat> findByFlightIdAndSeatNumberIn(Long flightId, List<String> seatNumbers);
    long countByFlightIdAndStatus(Long flightId, SeatStatus status);
}
