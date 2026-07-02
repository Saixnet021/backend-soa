package com.exporsan.certificacion.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notificaciones")
public class Notificacion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long procesoId;

    private Long usuarioId;

    @Column(nullable = false)
    private String tipo;

    @Column(nullable = false)
    private String mensaje;

    private String leida;

    private LocalDateTime fechaCreacion;

    public Notificacion() {
        this.leida = "NO";
        this.fechaCreacion = LocalDateTime.now();
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getProcesoId() { return procesoId; }
    public void setProcesoId(Long procesoId) { this.procesoId = procesoId; }
    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    public String getMensaje() { return mensaje; }
    public void setMensaje(String mensaje) { this.mensaje = mensaje; }
    public String getLeida() { return leida; }
    public void setLeida(String leida) { this.leida = leida; }
    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }
}
