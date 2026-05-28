package com.exporsan.exportrace.repository;

import com.exporsan.exportrace.model.AuditoriaCalidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AuditoriaCalidadRepository extends JpaRepository<AuditoriaCalidad, Long> {
    List<AuditoriaCalidad> findByLoteId(Long loteId);
}
