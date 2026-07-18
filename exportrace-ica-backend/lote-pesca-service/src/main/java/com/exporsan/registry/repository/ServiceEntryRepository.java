package com.exporsan.registry.repository;

import com.exporsan.registry.model.ServiceEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ServiceEntryRepository extends JpaRepository<ServiceEntry, Long> {
    Optional<ServiceEntry> findByServiceName(String serviceName);
    List<ServiceEntry> findByCategory(String category);
    List<ServiceEntry> findByStatus(String status);
}
