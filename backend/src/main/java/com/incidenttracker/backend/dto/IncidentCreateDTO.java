package com.incidenttracker.backend.dto;

import com.incidenttracker.backend.entity.IncidentStatus;
import com.incidenttracker.backend.entity.Severity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record IncidentCreateDTO(
    @NotBlank(message = "Title is required")
    @Size(max = 255)
    String title,

    @NotBlank(message = "Service is required")
    @Size(max = 100)
    String service,

    @NotNull(message = "Severity is required")
    Severity severity,

    IncidentStatus status,

    @NotBlank(message = "Owner is required")
    @Size(max = 100)
    String owner,

    @Size(max = 2000)
    String summary
) {
}
