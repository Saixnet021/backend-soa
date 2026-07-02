package com.exporsan.lote.soap;

import jakarta.xml.bind.annotation.*;

@XmlRootElement(name = "ValidarEstadoEmbarcacionRequest", namespace = "http://exporsan.com/embarcaciones")
@XmlAccessorType(XmlAccessType.FIELD)
public class ValidarEstadoEmbarcacionRequest {
    private String matricula;

    public String getMatricula() { return matricula; }
    public void setMatricula(String matricula) { this.matricula = matricula; }
}
