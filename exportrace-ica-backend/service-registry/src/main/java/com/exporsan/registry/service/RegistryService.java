package com.exporsan.registry.service;

import com.exporsan.registry.model.ServiceEntry;
import com.exporsan.registry.repository.ServiceEntryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class RegistryService {

    @Autowired
    private ServiceEntryRepository repository;

    public ServiceEntry register(ServiceEntry entry) {
        Optional<ServiceEntry> existing = repository.findByServiceName(entry.getServiceName());
        if (existing.isPresent()) {
            ServiceEntry e = existing.get();
            e.setServiceUrl(entry.getServiceUrl());
            e.setDescription(entry.getDescription());
            e.setCategory(entry.getCategory());
            e.setVersion(entry.getVersion());
            e.setStatus("ACTIVE");
            e.setLastHeartbeat(LocalDateTime.now());
            return repository.save(e);
        }
        entry.setRegisteredAt(LocalDateTime.now());
        entry.setLastHeartbeat(LocalDateTime.now());
        return repository.save(entry);
    }

    public void unregister(String serviceName) {
        repository.findByServiceName(serviceName).ifPresent(e -> {
            e.setStatus("INACTIVE");
            repository.save(e);
        });
    }

    public void heartbeat(String serviceName) {
        repository.findByServiceName(serviceName).ifPresent(e -> {
            e.setLastHeartbeat(LocalDateTime.now());
            repository.save(e);
        });
    }

    public List<ServiceEntry> findAll() {
        return repository.findAll();
    }

    public Optional<ServiceEntry> findByName(String serviceName) {
        return repository.findByServiceName(serviceName);
    }

    public List<ServiceEntry> findByCategory(String category) {
        return repository.findByCategory(category);
    }

    @Scheduled(fixedDelay = 60000)
    public void checkHeartbeats() {
        LocalDateTime threshold = LocalDateTime.now().minusMinutes(5);
        repository.findAll().forEach(entry -> {
            if ("ACTIVE".equals(entry.getStatus()) && entry.getLastHeartbeat().isBefore(threshold)) {
                entry.setStatus("UNHEALTHY");
                repository.save(entry);
            }
        });
    }
}
