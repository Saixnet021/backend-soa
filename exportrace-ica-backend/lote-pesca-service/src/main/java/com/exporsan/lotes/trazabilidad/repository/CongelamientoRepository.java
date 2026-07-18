package com.exporsan.lotes.trazabilidad.repository;

import com.exporsan.lotes.trazabilidad.model.Congelamiento;
import com.exporsan.lotes.trazabilidad.model.Procesamiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CongelamientoRepository extends JpaRepository<Congelamiento, Long> {
    Optional<Congelamiento> findByLoteOrigen(Procesamiento loteOrigen);

    @Query("SELECT c FROM Congelamiento c WHERE c.estado = 'APTO_PARA_EXPORTACION' AND " +
           "NOT EXISTS (SELECT d FROM Despacho d WHERE d.lote = c AND d.estado = 'DESPACHADO_EN_TRANSITO') " +
           "ORDER BY c.fechaHoraIngresoCamara ASC")
    List<Congelamiento> findAvailableForDispatch();
}
