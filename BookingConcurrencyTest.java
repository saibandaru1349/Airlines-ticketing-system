package com.airline.ticketing;

import com.airline.ticketing.dto.*;
import com.airline.ticketing.entity.*;
import com.airline.ticketing.repository.SeatRepository;
import com.airline.ticketing.repository.UserRepository;
import com.airline.ticketing.service.AdminService;
import com.airline.ticketing.service.BookingService;
import com.airline.ticketing.service.FlightService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class BookingConcurrencyTest {

    @Autowired AdminService adminService;
    @Autowired FlightService flightService;
    @Autowired BookingService bookingService;
    @Autowired UserRepository userRepo;
    @Autowired SeatRepository seatRepo;

    private FlightResponse newFlight(String code1, String code2, String number) {
        adminService.createAirport(new AirportRequest(code1, "Test " + code1, "City " + code1));
        adminService.createAirport(new AirportRequest(code2, "Test " + code2, "City " + code2));
        Aircraft ac = adminService.createAircraft(new AircraftRequest("Test jet", 6, 0));
        LocalDateTime dep = LocalDateTime.now().plusDays(2);
        return flightService.createFlight(new FlightRequest(number, code1, code2, ac.getId(),
                dep, dep.plusHours(1), new BigDecimal("1000")));
    }

    private void newUser(String email) {
        userRepo.save(User.builder().name(email).email(email).password("x").role(Role.USER).build());
    }

    private BookingRequest oneSeat(Long flightId, String seat) {
        return new BookingRequest(flightId, List.of(new PassengerRequest("Pax", 30, "M", seat)));
    }

    @Test
    void twoUsersRacingForTheSameSeat_onlyOneWins() throws Exception {
        FlightResponse flight = newFlight("AAA", "AAB", "T-100");
        newUser("u1@test.com");
        newUser("u2@test.com");

        ExecutorService pool = Executors.newFixedThreadPool(2);
        CountDownLatch go = new CountDownLatch(1);
        List<Future<BookingResponse>> results = new ArrayList<>();
        for (String email : List.of("u1@test.com", "u2@test.com")) {
            results.add(pool.submit(() -> {
                go.await();
                return bookingService.createBooking(email, oneSeat(flight.id(), "1A"));
            }));
        }
        go.countDown();

        int success = 0, failed = 0;
        for (Future<BookingResponse> f : results) {
            try { f.get(15, TimeUnit.SECONDS); success++; }
            catch (ExecutionException e) { failed++; }
        }
        pool.shutdown();

        assertEquals(1, success, "exactly one booking must succeed");
        assertEquals(1, failed, "the loser must be rejected (conflict)");
    }

    @Test
    void fullLifecycle_hold_pay_cancel_releasesSeat() {
        FlightResponse flight = newFlight("BBA", "BBB", "T-200");
        newUser("u3@test.com");

        BookingResponse b = bookingService.createBooking("u3@test.com", oneSeat(flight.id(), "1A"));
        assertEquals(BookingStatus.PENDING_PAYMENT, b.status());
        assertEquals(0, new BigDecimal("1000.00").compareTo(b.totalAmount()));
        assertEquals(5, flightService.getFlight(flight.id()).availableSeats());

        BookingResponse paid = bookingService.pay("u3@test.com", b.pnr());
        assertEquals(BookingStatus.CONFIRMED, paid.status());
        assertEquals(PaymentStatus.SUCCESS, paid.paymentStatus());

        BookingResponse cancelled = bookingService.cancel("u3@test.com", b.pnr());
        assertEquals(BookingStatus.CANCELLED, cancelled.status());
        assertEquals(PaymentStatus.REFUNDED, cancelled.paymentStatus());
        assertEquals(6, flightService.getFlight(flight.id()).availableSeats());
    }
}
