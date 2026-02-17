package com.incidenttracker.backend.repository;

import com.incidenttracker.backend.entity.Incident;
import com.incidenttracker.backend.entity.IncidentStatus;
import com.incidenttracker.backend.entity.Severity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, UUID> {

    Optional<Incident> findById(UUID id);

    @Query("""
        SELECT i FROM Incident i
        WHERE (:severity IS NULL OR i.severity = :severity)
        AND (:status IS NULL OR i.status = :status)
        AND (
            :search IS NULL OR :search = ''
            OR LOWER(i.title) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(i.service) LIKE LOWER(CONCAT('%', :search, '%'))
            OR (i.owner IS NOT NULL AND LOWER(i.owner) LIKE LOWER(CONCAT('%', :search, '%')))
            OR (i.summary IS NOT NULL AND LOWER(i.summary) LIKE LOWER(CONCAT('%', :search, '%')))
        )
        ORDER BY CASE
            WHEN :search IS NULL OR :search = '' THEN 0
            WHEN LOWER(i.title) LIKE LOWER(CONCAT(:search, '%')) THEN 0
            ELSE 1
        END
        """)
    Page<Incident> findAllWithFilters(
        @Param("severity") Severity severity,
        @Param("status") IncidentStatus status,
        @Param("search") String search,
        Pageable pageable
    );
}
