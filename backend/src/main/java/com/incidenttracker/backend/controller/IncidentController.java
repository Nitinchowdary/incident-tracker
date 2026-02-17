package com.incidenttracker.backend.controller;

import com.incidenttracker.backend.dto.IncidentCreateDTO;
import com.incidenttracker.backend.dto.IncidentResponseDTO;
import com.incidenttracker.backend.dto.IncidentUpdateDTO;
import com.incidenttracker.backend.entity.IncidentStatus;
import com.incidenttracker.backend.entity.Severity;
import com.incidenttracker.backend.service.IncidentService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/incidents")
public class IncidentController {

    private final IncidentService incidentService;

    public IncidentController(IncidentService incidentService) {
        this.incidentService = incidentService;
    }

    @PostMapping
    public ResponseEntity<IncidentResponseDTO> create(@Valid @RequestBody IncidentCreateDTO createDTO) {
        IncidentResponseDTO response = incidentService.create(createDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<Page<IncidentResponseDTO>> findAll(
        @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
        @RequestParam(required = false) Severity severity,
        @RequestParam(required = false) IncidentStatus status,
        @RequestParam(required = false) String search
    ) {
        Page<IncidentResponseDTO> incidents = incidentService.findAll(severity, status, search, pageable);
        return ResponseEntity.ok(incidents);
    }

    @GetMapping("/{id}")
    public ResponseEntity<IncidentResponseDTO> findById(@PathVariable UUID id) {
        IncidentResponseDTO response = incidentService.findById(id);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<IncidentResponseDTO> update(
        @PathVariable UUID id,
        @RequestBody IncidentUpdateDTO updateDTO
    ) {
        IncidentResponseDTO response = incidentService.update(id, updateDTO);
        return ResponseEntity.ok(response);
    }
}
