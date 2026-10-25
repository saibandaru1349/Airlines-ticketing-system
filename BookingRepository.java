package com.airline.ticketing.repository;

import com.airline.ticketing.entity.Booking;
import com.airline.ticketing.entity.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    Optional<Booking> findByPnr(String pnr);
    boolean existsByPnr(String pnr);
    Page<Booking> findByUserEmailOrderByBookedAtDesc(String email, Pageable pageable);
    List<Booking> findByStatusAndHoldExpiresAtBefore(BookingStatus status, LocalDateTime time);
}
