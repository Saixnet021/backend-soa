package com.exporsan.lotes.soap;

import jakarta.xml.bind.annotation.*;
import java.util.ArrayList;
import java.util.List;

@XmlRootElement(name = "ObtenerEmbarcacionesResponse", namespace = "http://exporsan.com/embarcaciones")
@XmlAccessorType(XmlAccessType.FIELD)
public class ObtenerEmbarcacionesResponse {
    @XmlElement(name = "embarcaciones", namespace = "http://exporsan.com/embarcaciones")
    private List<EmbarcacionType> embarcaciones = new ArrayList<>();

    public List<EmbarcacionType> getEmbarcaciones() { return embarcaciones; }
    public void setEmbarcaciones(List<EmbarcacionType> embarcaciones) { this.embarcaciones = embarcaciones; }
}
