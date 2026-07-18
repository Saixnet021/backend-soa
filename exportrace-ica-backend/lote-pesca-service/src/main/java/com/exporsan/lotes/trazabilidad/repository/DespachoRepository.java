package com.exporsan.lotes.trazabilidad.repository;

import com.exporsan.lotes.trazabilidad.model.Congelamiento;
import com.exporsan.lotes.trazabilidad.model.Despacho;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DespachoRepository extends JpaRepository<Despacho, Long> {
    Optional<Despacho> findByLote(Congelamiento lote);
}
