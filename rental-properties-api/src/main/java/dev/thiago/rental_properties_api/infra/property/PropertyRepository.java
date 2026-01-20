package dev.thiago.rental_properties_api.infra.property;

import dev.thiago.rental_properties_api.domain.property.Property;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PropertyRepository extends JpaRepository<Property, Long> {

    // Lista imóveis filtrando por localização (contém, ignore case) com paginação
    Page<Property> findByLocationContainingIgnoreCase(String location, Pageable pageable);
}
