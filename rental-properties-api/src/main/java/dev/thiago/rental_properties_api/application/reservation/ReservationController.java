package dev.thiago.rental_properties_api.application.reservation;
import dev.thiago.rental_properties_api.domain.property.Property;
import dev.thiago.rental_properties_api.domain.reservation.Reservation;
import dev.thiago.rental_properties_api.domain.reservation.ReservationStatus;
import dev.thiago.rental_properties_api.infra.property.PropertyRepository;
import dev.thiago.rental_properties_api.infra.reservation.ReservationRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.net.URI;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@RestController
@RequestMapping("/reservations")
@CrossOrigin(origins = "http://localhost:5173")
public class ReservationController {

    private final ReservationRepository reservationRepository;
    private final PropertyRepository propertyRepository;

    public ReservationController(ReservationRepository reservationRepository,
                                 PropertyRepository propertyRepository) {
        this.reservationRepository = reservationRepository;
        this.propertyRepository = propertyRepository;
    }

    // POST /reservations -> cria uma reserva para um imóvel
    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody ReservationRequest request) {
        // 1) Verificar se o imóvel existe
        Property property = propertyRepository.findById(request.propertyId())
                .orElse(null);

        if (property == null) {
            return ResponseEntity.badRequest().body("Property not found with id=" + request.propertyId());
        }

        // 2) Validar datas
        LocalDate checkIn = request.checkIn();
        LocalDate checkOut = request.checkOut();

        if (!checkOut.isAfter(checkIn)) {
            return ResponseEntity.badRequest().body("checkOut must be after checkIn");
        }

        // 3) Calcular número de noites
        long nights = ChronoUnit.DAYS.between(checkIn, checkOut);

        // 4) Calcular valor total (diária x noites)
        BigDecimal totalPrice = property.getNightlyPrice()
                .multiply(BigDecimal.valueOf(nights));

         // 5) Verificar conflito de datas com outras reservas (evitar overbooking)
        var conflicts = reservationRepository
                .findByPropertyIdAndCheckOutGreaterThanEqualAndCheckInLessThanEqual(
                        property.getId(), checkIn, checkOut
                );

        if (!conflicts.isEmpty()) {
            return ResponseEntity
                    .badRequest()
                    .body("There is already a reservation for this property in the selected period.");
        }

        // 6) Criar a reserva
        Reservation reservation = Reservation.builder()
                .property(property)
                .guestName(request.guestName())
                .guestEmail(request.guestEmail())
                .checkIn(checkIn)
                .checkOut(checkOut)
                .totalPrice(totalPrice)
                .status(ReservationStatus.BOOKED)
                .createdAt(LocalDate.now())
                .build();

        Reservation saved = reservationRepository.save(reservation);

        ReservationResponse response = toResponse(saved);

        return ResponseEntity
                .created(URI.create("/reservations/" + saved.getId()))
                .body(response);
    }

    // GET /reservations/by-property/{propertyId} -> lista reservas de um imóvel
    @GetMapping("/by-property/{propertyId}")
    public ResponseEntity<List<ReservationResponse>> listByProperty(@PathVariable Long propertyId) {
        if (!propertyRepository.existsById(propertyId)) {
            return ResponseEntity.notFound().build();
        }

        List<Reservation> reservations = reservationRepository.findByPropertyId(propertyId);

        List<ReservationResponse> responseList = reservations.stream()
                .map(this::toResponse)
                .toList();

        return ResponseEntity.ok(responseList);
    }

    private ReservationResponse toResponse(Reservation reservation) {
        return new ReservationResponse(
                reservation.getId(),
                reservation.getProperty().getId(),
                reservation.getProperty().getTitle(),
                reservation.getGuestName(),
                reservation.getGuestEmail(),
                reservation.getCheckIn(),
                reservation.getCheckOut(),
                reservation.getTotalPrice(),
                reservation.getStatus()
        );
    }
}
