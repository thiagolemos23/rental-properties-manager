package dev.thiago.rental_properties_api;


public enum PropertyStatus {
    AVAILABLE,   // disponível para aluguel
    INACTIVE,    // imóvel cadastrado, mas não está sendo alugado
    BLOCKED      // bloqueado (manutenção, problema, etc.)
}
