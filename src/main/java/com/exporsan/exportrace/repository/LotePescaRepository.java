package com.exporsan.exportrace.repository;

import com.exporsan.exportrace.model.Especie;
import com.exporsan.exportrace.model.LotePesca;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LotePescaRepository extends JpaRepository<LotePesca, Long> {
    List<LotePesca> findByEspecieAndEstadoSanipes(Especie especie, String estadoSanipes);
    List<LotePesca> findByEstadoGeneral(String estadoGeneral);
}
