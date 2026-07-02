package com.exporsan.lote.repository;

import com.exporsan.lote.domain.Embarcacion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface EmbarcacionRepository extends JpaRepository<Embarcacion, Long> {
    Optional<Embarcacion> findByMatricula(String matricula);
    List<Embarcacion> findByNombreEmbarcacionContainingIgnoreCase(String nombre);
    List<Embarcacion> findByEstado(String estado);
}
