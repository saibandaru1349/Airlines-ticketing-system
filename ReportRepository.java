package com.airline.ticketing.repository;

import com.airline.ticketing.dto.RevenueRow;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import java.util.List;

/** Plain JDBC (JdbcTemplate) for an aggregate report - shows when raw SQL beats JPA. */
@Repository
@RequiredArgsConstructor
public class ReportRepository {

    private final JdbcTemplate jdbc;

    public List<RevenueRow> revenuePerFlight() {
        String sql = """
                SELECT f.flight_number AS flight_number,
                       COUNT(b.id) AS confirmed_bookings,
                       COALESCE(SUM(b.total_amount), 0) AS revenue
                FROM flights f
                LEFT JOIN bookings b ON b.flight_id = f.id AND b.status = 'CONFIRMED'
                GROUP BY f.id, f.flight_number
                ORDER BY revenue DESC
                """;
        return jdbc.query(sql, (rs, i) -> new RevenueRow(
                rs.getString("flight_number"),
                rs.getLong("confirmed_bookings"),
                rs.getBigDecimal("revenue")));
    }
}
