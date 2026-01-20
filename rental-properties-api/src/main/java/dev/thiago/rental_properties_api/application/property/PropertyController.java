package dev.thiago.rental_properties_api.application.property;
import dev.thiago.rental_properties_api.PropertyStatus;
import dev.thiago.rental_properties_api.domain.property.Property;
import dev.thiago.rental_properties_api.infra.property.PropertyRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.net.URI;

@RestController
@RequestMapping("/properties")
@CrossOrigin(origins = "http://localhost:5173")
public class PropertyController {

    private final PropertyRepository propertyRepository;

    public PropertyController(PropertyRepository propertyRepository) {
        this.propertyRepository = propertyRepository;
    }

    // GET /properties  -> lista imóveis com paginação e filtro opcional por localização
    @GetMapping
    public org.springframework.data.domain.Page<PropertyResponse> listAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String location
    ) {
        var pageable = org.springframework.data.domain.PageRequest.of(page, size);

        var result = (location == null || location.isBlank())
                ? propertyRepository.findAll(pageable)
                : propertyRepository.findByLocationContainingIgnoreCase(location, pageable);

        return result.map(this::toResponse);
    }

    // GET /properties/{id} -> busca um imóvel específico
    @GetMapping("/{id}")
    public ResponseEntity<PropertyResponse> getById(@PathVariable Long id) {
        return propertyRepository.findById(id)
                .map(property -> ResponseEntity.ok(toResponse(property)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // POST /properties  -> cria um novo imóvel
    @PostMapping
    public ResponseEntity<PropertyResponse> create(@Valid @RequestBody PropertyRequest request) {
       Property property = Property.builder()
        .title(request.title())
        .type(request.type())
        .location(request.location())
        .status(PropertyStatus.AVAILABLE) // padrão por enquanto
        .nightlyPrice(request.nightlyPrice())
        .maxGuests(request.maxGuests())
        .description(request.description())
        .build();

        Property saved = propertyRepository.save(property);

        return ResponseEntity
                .created(URI.create("/properties/" + saved.getId()))
                .body(toResponse(saved));
    }

    // PUT /properties/{id} -> atualiza os dados básicos do imóvel
    @PutMapping("/{id}")
    public ResponseEntity<PropertyResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody PropertyRequest request
    ) {
        return propertyRepository.findById(id)
                .map(existing -> {
                    existing.setTitle(request.title());
                    existing.setType(request.type());
                    existing.setLocation(request.location());
                    existing.setNightlyPrice(request.nightlyPrice());
                    existing.setMaxGuests(request.maxGuests());
                    existing.setDescription(request.description());
                    // status por enquanto não mexemos aqui

                    Property updated = propertyRepository.save(existing);
                    return ResponseEntity.ok(toResponse(updated));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!propertyRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        propertyRepository.deleteById(id);
        return ResponseEntity.noContent().build(); // 204
    }


   private PropertyResponse toResponse(Property property) {
    return new PropertyResponse(
            property.getId(),
            property.getTitle(),
            property.getType(),
            property.getLocation(),
            property.getStatus() != null ? property.getStatus().name() : null,
            property.getNightlyPrice(),
            property.getMaxGuests(),
            property.getDescription()
    );
}
}
