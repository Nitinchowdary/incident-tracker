package com.incidenttracker.backend.dto;

import com.incidenttracker.backend.entity.IncidentStatus;
import com.incidenttracker.backend.entity.Severity;

import java.time.Instant;
import java.util.UUID;

public record IncidentResponseDTO(
    UUID id,
    String title,
    String service,
    Severity severity,
    IncidentStatus status,
    String owner,
    String summary,
    Instant createdAt,
    Instant updatedAt
) {
}
