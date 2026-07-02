package com.exporsan.lotes.repository;

import com.exporsan.lotes.model.Empresa;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface EmpresaRepository extends JpaRepository<Empresa, Long> {
    Optional<Empresa> findByRuc(String ruc);
    Optional<Empresa> findByRazonSocialContainingIgnoreCase(String razonSocial);
}
