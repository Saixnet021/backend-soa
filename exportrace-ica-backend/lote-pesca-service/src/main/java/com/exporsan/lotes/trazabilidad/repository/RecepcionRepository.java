package com.exporsan.lotes.trazabilidad.repository;

import com.exporsan.lotes.trazabilidad.model.Recepcion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RecepcionRepository extends JpaRepository<Recepcion, Long> {
}
