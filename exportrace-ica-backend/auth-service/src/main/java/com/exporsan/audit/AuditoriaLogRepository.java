package com.exporsan.audit;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AuditoriaLogRepository extends JpaRepository<AuditoriaLog, Long> {
    List<AuditoriaLog> findByEntidadAndEntidadIdOrderByTimestampDesc(String entidad, String entidadId);
    List<AuditoriaLog> findAllByOrderByTimestampDesc();
}
