package com.exporsan.lotes.soap;

import jakarta.xml.bind.annotation.*;

@XmlRootElement(name = "RegistrarEmbarcacionResponse", namespace = "http://exporsan.com/embarcaciones")
@XmlAccessorType(XmlAccessType.FIELD)
public class RegistrarEmbarcacionResponse {
    @XmlElement(namespace = "http://exporsan.com/embarcaciones")
    private Long id;

    @XmlElement(namespace = "http://exporsan.com/embarcaciones")
    private String mensaje;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getMensaje() { return mensaje; }
    public void setMensaje(String mensaje) { this.mensaje = mensaje; }
}
