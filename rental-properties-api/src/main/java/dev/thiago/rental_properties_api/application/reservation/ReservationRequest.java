package dev.thiago.rental_properties_api.application.reservation;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record ReservationRequest(
        @NotNull Long propertyId,
        @NotBlank String guestName,
        @NotBlank @Email String guestEmail,
        @NotNull LocalDate checkIn,
        @NotNull LocalDate checkOut
) {
}
