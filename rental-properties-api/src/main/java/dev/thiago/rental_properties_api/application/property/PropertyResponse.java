package dev.thiago.rental_properties_api.application.property;

import java.math.BigDecimal;

public record PropertyResponse(
        Long id,
        String title,
        String type,
        String location,
        String status,
        BigDecimal nightlyPrice,
        Integer maxGuests,
        String description
) {}
