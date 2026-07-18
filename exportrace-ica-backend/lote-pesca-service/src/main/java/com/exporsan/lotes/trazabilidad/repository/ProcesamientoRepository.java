package com.exporsan.lotes.trazabilidad.repository;

import com.exporsan.lotes.trazabilidad.model.Procesamiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProcesamientoRepository extends JpaRepository<Procesamiento, Long> {
    Optional<Procesamiento> findByIdLoteProduccion(String idLoteProduccion);

    @Query("SELECT COUNT(p) FROM Procesamiento p WHERE p.idLoteProduccion LIKE :prefix%")
    long countByIdLoteProduccionStartingWith(@Param("prefix") String prefix);
}
