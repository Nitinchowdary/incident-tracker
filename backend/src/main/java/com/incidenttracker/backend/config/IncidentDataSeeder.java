package com.incidenttracker.backend.config;

import com.github.javafaker.Faker;
import com.incidenttracker.backend.entity.Incident;
import com.incidenttracker.backend.entity.IncidentStatus;
import com.incidenttracker.backend.entity.Severity;
import com.incidenttracker.backend.repository.IncidentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Configuration
public class IncidentDataSeeder {

    private static final Logger log = LoggerFactory.getLogger(IncidentDataSeeder.class);
    private static final int SEED_COUNT = 200;

    private static final String[] SERVICES = {
        "Payment Gateway", "User Authentication", "API Gateway", "Notification Service",
        "Search Engine", "Order Service", "Inventory Service", "Analytics Platform",
        "CDN", "Database Cluster", "Cache Layer", "Message Queue",
        "File Storage", "Email Service", "SMS Gateway", "Reporting Service"
    };

    @Bean
    @ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true")
    CommandLineRunner seedIncidents(IncidentRepository incidentRepository) {
        return args -> {
            if (incidentRepository.count() > 0) {
                log.info("Incidents already exist, skipping seed.");
                return;
            }

            Faker faker = new Faker(Locale.of("en", "IN"));

            Instant baseDate = Instant.now().minus(180, ChronoUnit.DAYS);
            List<Incident> incidents = IntStream.range(0, SEED_COUNT)
                .mapToObj(i -> createFakeIncident(faker, baseDate, i))
                .collect(Collectors.toList());

            incidentRepository.saveAll(incidents);
            log.info("Seeded {} fake incidents successfully.", SEED_COUNT);
        };
    }

    private Incident createFakeIncident(Faker faker, Instant baseDate, int index) {
        Incident incident = new Incident();
        incident.setTitle(faker.company().catchPhrase());
        incident.setService(SERVICES[faker.random().nextInt(SERVICES.length)]);
        incident.setSeverity(Severity.values()[faker.random().nextInt(Severity.values().length)]);
        incident.setStatus(IncidentStatus.values()[faker.random().nextInt(IncidentStatus.values().length)]);
        incident.setOwner(faker.name().fullName());
        incident.setSummary(faker.random().nextBoolean()
            ? faker.company().catchPhrase() + ". " + faker.company().bs()
            : null);
        long randomDays = faker.random().nextInt(180);
        Instant created = baseDate.plus(randomDays, ChronoUnit.DAYS);
        incident.setCreatedAt(created);
        incident.setUpdatedAt(created.plus(faker.random().nextInt(0, 72), ChronoUnit.HOURS));
        return incident;
    }
}
