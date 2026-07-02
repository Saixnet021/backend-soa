package com.exporsan.lotes.soap;

import jakarta.xml.bind.annotation.*;

@XmlRootElement(name = "ObtenerEmbarcacionesRequest", namespace = "http://exporsan.com/embarcaciones")
@XmlAccessorType(XmlAccessType.FIELD)
public class ObtenerEmbarcacionesRequest {
    private Long idLote;
    private String nombre;

    public Long getIdLote() { return idLote; }
    public void setIdLote(Long idLote) { this.idLote = idLote; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
}
