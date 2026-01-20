package dev.thiago.rental_properties_api.application.reservation;

import dev.thiago.rental_properties_api.domain.reservation.ReservationStatus;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ReservationResponse(
        Long id,
        Long propertyId,
        String propertyTitle,
        String guestName,
        String guestEmail,
        LocalDate checkIn,
        LocalDate checkOut,
        BigDecimal totalPrice,
        ReservationStatus status
) {
}
