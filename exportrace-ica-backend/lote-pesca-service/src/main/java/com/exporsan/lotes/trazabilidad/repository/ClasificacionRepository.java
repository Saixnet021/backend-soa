package com.exporsan.lotes.trazabilidad.repository;

import com.exporsan.lotes.trazabilidad.model.Clasificacion;
import com.exporsan.lotes.trazabilidad.model.ClasificacionEstado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClasificacionRepository extends JpaRepository<Clasificacion, Long> {
    List<Clasificacion> findAllByEstadoNot(ClasificacionEstado estado);
}
