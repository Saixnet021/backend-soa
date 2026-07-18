package com.exporsan.certificacion.repository;

import com.exporsan.certificacion.model.ProcesoNegocio;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProcesoNegocioRepository extends JpaRepository<ProcesoNegocio, Long> {
    List<ProcesoNegocio> findByLoteIdOrderByFechaInicioDesc(Long loteId);
    List<ProcesoNegocio> findByEstadoOrderByFechaInicioDesc(String estado);
    List<ProcesoNegocio> findByTipoProcesoOrderByFechaInicioDesc(String tipoProceso);
}
