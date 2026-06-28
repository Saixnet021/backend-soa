package com.exporsan.lotes.repository;

import com.exporsan.lotes.model.Especie;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EspecieRepository extends JpaRepository<Especie, Long> {

    Optional<Especie> findByNombreComunIgnoreCase(String nombreComun);
}
