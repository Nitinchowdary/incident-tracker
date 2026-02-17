package com.incidenttracker.backend.dto;

import com.incidenttracker.backend.entity.IncidentStatus;
import com.incidenttracker.backend.entity.Severity;

public record IncidentUpdateDTO(
    IncidentStatus status,
    Severity severity,
    String summary
) {
}
