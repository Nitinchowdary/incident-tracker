package com.incidenttracker.backend.service;

import com.incidenttracker.backend.dto.IncidentCreateDTO;
import com.incidenttracker.backend.dto.IncidentResponseDTO;
import com.incidenttracker.backend.dto.IncidentUpdateDTO;
import com.incidenttracker.backend.entity.Incident;
import com.incidenttracker.backend.entity.IncidentStatus;
import com.incidenttracker.backend.entity.Severity;
import com.incidenttracker.backend.exception.ResourceNotFoundException;
import com.incidenttracker.backend.mapper.IncidentMapper;
import com.incidenttracker.backend.repository.IncidentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
public class IncidentService {

    private final IncidentRepository incidentRepository;
    private final IncidentMapper incidentMapper;

    public IncidentService(IncidentRepository incidentRepository, IncidentMapper incidentMapper) {
        this.incidentRepository = incidentRepository;
        this.incidentMapper = incidentMapper;
    }

    @Transactional
    public IncidentResponseDTO create(IncidentCreateDTO createDTO) {
        Incident incident = incidentMapper.toEntity(createDTO);
        Incident saved = incidentRepository.save(incident);
        return incidentMapper.toResponseDTO(saved);
    }

    public Page<IncidentResponseDTO> findAll(
        Severity severity,
        IncidentStatus status,
        String search,
        Pageable pageable
    ) {
        Page<Incident> incidents = incidentRepository.findAllWithFilters(
            severity,
            status,
            search != null && search.isBlank() ? null : search,
            pageable
        );
        return incidents.map(incidentMapper::toResponseDTO);
    }

    public IncidentResponseDTO findById(UUID id) {
        Incident incident = incidentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Incident", id));
        return incidentMapper.toResponseDTO(incident);
    }

    @Transactional
    public IncidentResponseDTO update(UUID id, IncidentUpdateDTO updateDTO) {
        Incident incident = incidentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Incident", id));
        if (updateDTO.status() != null) incident.setStatus(updateDTO.status());
        if (updateDTO.severity() != null) incident.setSeverity(updateDTO.severity());
        if (updateDTO.summary() != null)
            incident.setSummary(updateDTO.summary().isBlank() ? null : updateDTO.summary());
        incident.setUpdatedAt(Instant.now());
        Incident updated = incidentRepository.save(incident);
        return incidentMapper.toResponseDTO(updated);
    }
}
