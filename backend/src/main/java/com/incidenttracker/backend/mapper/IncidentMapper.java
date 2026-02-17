package com.incidenttracker.backend.mapper;

import com.incidenttracker.backend.dto.IncidentCreateDTO;
import com.incidenttracker.backend.dto.IncidentResponseDTO;
import com.incidenttracker.backend.entity.Incident;
import com.incidenttracker.backend.entity.IncidentStatus;
import org.springframework.stereotype.Component;

@Component
public class IncidentMapper {

    public Incident toEntity(IncidentCreateDTO dto) {
        Incident incident = new Incident();
        incident.setTitle(dto.title());
        incident.setService(dto.service());
        incident.setSeverity(dto.severity());
        incident.setStatus(dto.status() != null ? dto.status() : IncidentStatus.OPEN);
        incident.setOwner(dto.owner());
        incident.setSummary(dto.summary());
        return incident;
    }

    public IncidentResponseDTO toResponseDTO(Incident entity) {
        return new IncidentResponseDTO(
            entity.getId(),
            entity.getTitle(),
            entity.getService(),
            entity.getSeverity(),
            entity.getStatus(),
            entity.getOwner(),
            entity.getSummary(),
            entity.getCreatedAt(),
            entity.getUpdatedAt()
        );
    }
}
