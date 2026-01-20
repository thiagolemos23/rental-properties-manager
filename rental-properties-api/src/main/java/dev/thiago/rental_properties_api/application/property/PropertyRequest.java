package dev.thiago.rental_properties_api.application.property;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record PropertyRequest(

        @NotBlank(message = "O título é obrigatório")
        String title,

        @NotBlank(message = "O tipo é obrigatório")
        String type,

        @NotBlank(message = "A localização é obrigatória")
        String location,

        @NotNull(message = "O preço da diária é obrigatório")
        @DecimalMin(value = "0.0", inclusive = false, message = "O preço da diária deve ser maior que zero")
        BigDecimal nightlyPrice,

        @NotNull(message = "A capacidade máxima é obrigatória")
        @Min(value = 1, message = "A capacidade mínima é 1 hóspede")
        Integer maxGuests,

        String description
) {}

