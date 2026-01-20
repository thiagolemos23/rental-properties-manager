package dev.thiago.rental_properties_api.domain.property;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;

import dev.thiago.rental_properties_api.PropertyStatus;

@Entity
@Table(name = "properties")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Property {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Nome curto pra identificar o imóvel (ex: "Casa pé na areia Porto")
    @Column(nullable = false)
    private String title;

    // Tipo: casa, apartamento, studio, etc.
    @Column(nullable = false)
    private String type;

    // Localização básica (cidade / bairro / praia)
    @Column(nullable = false)
    private String location;

    // Status do imóvel: AVAILABLE, RENTED, etc.
    @Enumerated(EnumType.STRING)
     @Column(nullable = false)
    private PropertyStatus status;

    // Preço da diária
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal nightlyPrice;

    // Capacidade máxima de hóspedes
    @Column(nullable = false)
    private Integer maxGuests;

    // Descrição mais detalhada
    @Column(columnDefinition = "TEXT")
    private String description;

    // Auditoria simples
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = this.createdAt;
    }

    @PreUpdate
    void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
