package com.exporsan.lotes.soap;

import jakarta.xml.bind.annotation.*;

@XmlRootElement(name = "ValidarEstadoEmbarcacionRequest", namespace = "http://exporsan.com/embarcaciones")
@XmlAccessorType(XmlAccessType.FIELD)
public class ValidarEstadoEmbarcacionRequest {
    @XmlElement(namespace = "http://exporsan.com/embarcaciones")
    private String matricula;

    public String getMatricula() { return matricula; }
    public void setMatricula(String matricula) { this.matricula = matricula; }
}
