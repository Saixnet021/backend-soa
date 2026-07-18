package com.exporsan.certificacion.repository;

import com.exporsan.certificacion.model.Notificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {
    List<Notificacion> findByUsuarioIdAndLeidaOrderByFechaCreacionDesc(Long usuarioId, String leida);
    List<Notificacion> findAllByOrderByFechaCreacionDesc();
}
