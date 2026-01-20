package dev.thiago.rental_properties_api.domain.reservation;

import dev.thiago.rental_properties_api.domain.property.Property;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

import dev.thiago.rental_properties_api.domain.reservation.ReservationStatus;


@Entity
@Table(name = "reservations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // imóvel da reserva
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @Column(nullable = false, length = 120)
    private String guestName;

    @Column(nullable = false, length = 180)
    private String guestEmail;

    @Column(nullable = false)
    private LocalDate checkIn;

    @Column(nullable = false)
    private LocalDate checkOut;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPrice;

    // BOOKED, CANCELLED, COMPLETED etc.
        @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReservationStatus status;

    @Column(nullable = false)
    private LocalDate createdAt;
}
