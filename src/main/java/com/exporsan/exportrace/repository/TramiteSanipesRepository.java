package com.exporsan.exportrace.repository;

import com.exporsan.exportrace.model.TramiteSanipes;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TramiteSanipesRepository extends JpaRepository<TramiteSanipes, Long> {
    Optional<TramiteSanipes> findByLoteId(Long loteId);
    List<TramiteSanipes> findByEstado(String estado);
}
