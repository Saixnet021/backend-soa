package com.exporsan.calidad.repository;

import com.exporsan.calidad.model.ReglaCalidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReglaCalidadRepository extends JpaRepository<ReglaCalidad, Long> {
    Optional<ReglaCalidad> findByCodigoEspecie(String codigoEspecie);
}
