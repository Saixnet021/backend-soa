package com.exporsan.certificacion.repository;

import com.exporsan.certificacion.model.TramiteSanipes;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TramiteSanipesRepository extends JpaRepository<TramiteSanipes, Long> {

    List<TramiteSanipes> findByIdLote(Long idLote);

    Optional<TramiteSanipes> findByIdLoteAndEstadoTramite(Long idLote, String estadoTramite);
}
