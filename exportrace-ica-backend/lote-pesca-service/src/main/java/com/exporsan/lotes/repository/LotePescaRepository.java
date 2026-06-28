package com.exporsan.lotes.repository;

import com.exporsan.lotes.model.LotePesca;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LotePescaRepository extends JpaRepository<LotePesca, Long> {

    List<LotePesca> findByEspecie(String especie);

    List<LotePesca> findByEstadoSanipes(String estadoSanipes);

    List<LotePesca> findByEspecieAndEstadoSanipes(String especie, String estadoSanipes);
}
