package dev.thiago.rental_properties_api.domain.reservation;

public enum ReservationStatus {
    BOOKED,     // reserva ativa
    CANCELLED,  // cliente cancelou
    COMPLETED   // reserva já realizada / finalizada
}

