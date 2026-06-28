package com.exporsan.calidad.repository;

import com.exporsan.calidad.model.AuditoriaCalidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditoriaCalidadRepository extends JpaRepository<AuditoriaCalidad, Long> {
    List<AuditoriaCalidad> findByIdLoteOrderByTimestampMedicionDesc(Long idLote);
}
