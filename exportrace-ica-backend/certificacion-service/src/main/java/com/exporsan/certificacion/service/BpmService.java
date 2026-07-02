package com.exporsan.certificacion.service;

import com.exporsan.certificacion.model.Notificacion;
import com.exporsan.certificacion.model.ProcesoNegocio;
import com.exporsan.certificacion.repository.NotificacionRepository;
import com.exporsan.certificacion.repository.ProcesoNegocioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class BpmService {

    @Autowired
    private ProcesoNegocioRepository procesoRepository;

    @Autowired
    private NotificacionRepository notificacionRepository;

    public ProcesoNegocio iniciarProceso(String tipoProceso, Long loteId, Long usuarioId) {
        ProcesoNegocio proceso = new ProcesoNegocio();
        proceso.setTipoProceso(tipoProceso);
        proceso.setLoteId(loteId);
        proceso.setEstado("INICIADO");
        proceso.setSubEstado("ESPERANDO_DOCUMENTACION");
        proceso.setFechaInicio(LocalDateTime.now());
        proceso.setFechaLimite(LocalDateTime.now().plusDays(30));
        
        ProcesoNegocio saved = procesoRepository.save(proceso);
        
        crearNotificacion(saved.getId(), usuarioId, "PROCESO_INICIADO",
                "Se ha iniciado el proceso de " + tipoProceso + " para el lote #" + loteId);
        
        return saved;
    }

    public ProcesoNegocio avanzarProceso(Long procesoId, String nuevoEstado, String subEstado, Long usuarioId) {
        ProcesoNegocio proceso = procesoRepository.findById(procesoId)
                .orElseThrow(() -> new RuntimeException("Proceso no encontrado: " + procesoId));
        
        String estadoAnterior = proceso.getEstado();
        proceso.setEstado(nuevoEstado);
        proceso.setSubEstado(subEstado);
        
        if ("COMPLETADO".equals(nuevoEstado) || "RECHAZADO".equals(nuevoEstado)) {
            proceso.setFechaFin(LocalDateTime.now());
        }
        
        ProcesoNegocio saved = procesoRepository.save(proceso);
        
        crearNotificacion(saved.getId(), usuarioId, "CAMBIO_ESTADO",
                "El proceso #" + procesoId + " cambió de " + estadoAnterior + " a " + nuevoEstado);
        
        return saved;
    }

    public ProcesoNegocio registrarResultado(Long procesoId, String resultado, Long usuarioId) {
        ProcesoNegocio proceso = procesoRepository.findById(procesoId)
                .orElseThrow(() -> new RuntimeException("Proceso no encontrado: " + procesoId));
        
        proceso.setResultado(resultado);
        proceso.setEstado("COMPLETADO");
        proceso.setFechaFin(LocalDateTime.now());
        
        ProcesoNegocio saved = procesoRepository.save(proceso);
        
        crearNotificacion(saved.getId(), usuarioId, "PROCESO_COMPLETADO",
                "El proceso #" + procesoId + " ha sido completado. Resultado: " + resultado);
        
        return saved;
    }

    public List<ProcesoNegocio> listarProcesos() {
        return procesoRepository.findAll();
    }

    public List<ProcesoNegocio> porLote(Long loteId) {
        return procesoRepository.findByLoteIdOrderByFechaInicioDesc(loteId);
    }

    public List<ProcesoNegocio> porEstado(String estado) {
        return procesoRepository.findByEstadoOrderByFechaInicioDesc(estado);
    }

    public Notificacion crearNotificacion(Long procesoId, Long usuarioId, String tipo, String mensaje) {
        Notificacion notificacion = new Notificacion();
        notificacion.setProcesoId(procesoId);
        notificacion.setUsuarioId(usuarioId);
        notificacion.setTipo(tipo);
        notificacion.setMensaje(mensaje);
        return notificacionRepository.save(notificacion);
    }

    public List<Notificacion> listarNotificaciones(Long usuarioId) {
        return notificacionRepository.findByUsuarioIdAndLeidaOrderByFechaCreacionDesc(usuarioId, "NO");
    }

    public List<Notificacion> todasLasNotificaciones() {
        return notificacionRepository.findAllByOrderByFechaCreacionDesc();
    }

    public void marcarLeida(Long notificacionId) {
        notificacionRepository.findById(notificacionId).ifPresent(n -> {
            n.setLeida("SI");
            notificacionRepository.save(n);
        });
    }
}
