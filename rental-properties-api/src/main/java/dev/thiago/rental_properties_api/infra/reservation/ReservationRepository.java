package dev.thiago.rental_properties_api.infra.reservation;

import dev.thiago.rental_properties_api.domain.reservation.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    // todas as reservas de um imóvel
    List<Reservation> findByPropertyId(Long propertyId);

    // reservas de um imóvel em um intervalo (útil pra evitar overbooking depois)
    List<Reservation> findByPropertyIdAndCheckOutGreaterThanEqualAndCheckInLessThanEqual(
            Long propertyId,
            LocalDate start,
            LocalDate end
    );
}
