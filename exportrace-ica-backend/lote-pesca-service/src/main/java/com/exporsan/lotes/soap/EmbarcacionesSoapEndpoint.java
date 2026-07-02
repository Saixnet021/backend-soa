package com.exporsan.lotes.soap;

import com.exporsan.lotes.model.Embarcacion;
import com.exporsan.lotes.model.Empresa;
import com.exporsan.lotes.repository.EmbarcacionRepository;
import com.exporsan.lotes.repository.EmpresaRepository;
import org.springframework.ws.server.endpoint.annotation.*;
import org.springframework.ws.soap.server.endpoint.annotation.SoapAction;
import org.springframework.beans.factory.annotation.Autowired;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Endpoint
public class EmbarcacionesSoapEndpoint {

    private static final String NAMESPACE = "http://exporsan.com/embarcaciones";

    @Autowired
    private EmbarcacionRepository repository;

    @Autowired
    private EmpresaRepository empresaRepository;

    @PayloadRoot(namespace = NAMESPACE, localPart = "ObtenerEmbarcacionesRequest")
    @ResponsePayload
    @SoapAction("ObtenerEmbarcaciones")
    public ObtenerEmbarcacionesResponse obtenerEmbarcaciones(@RequestPayload ObtenerEmbarcacionesRequest request) {
        ObtenerEmbarcacionesResponse response = new ObtenerEmbarcacionesResponse();

        List<Embarcacion> embarcaciones;
        if (request.getIdLote() != null) {
            Optional<Embarcacion> emb = repository.findById(request.getIdLote());
            embarcaciones = emb.map(List::of).orElse(List.of());
        } else if (request.getNombre() != null && !request.getNombre().isEmpty()) {
            embarcaciones = repository.findByNombreEmbarcacionContainingIgnoreCase(request.getNombre());
        } else {
            embarcaciones = repository.findAll();
        }

        for (Embarcacion e : embarcaciones) {
            EmbarcacionType tipo = new EmbarcacionType();
            tipo.setId(e.getId());
            tipo.setNombreEmbarcacion(e.getNombreEmbarcacion());
            tipo.setMatricula(e.getMatricula());
            tipo.setPuertoBase(e.getPuertoBase());
            tipo.setCapacidadToneladas(e.getCapacidadToneladas());
            tipo.setEstado(e.getEstado());
            tipo.setNombreCapitan(e.getNombreCapitan());
            tipo.setLicenciaCapitan(e.getLicenciaCapitan());
            if (e.getEmpresa() != null) {
                tipo.setIdEmpresa(e.getEmpresa().getId());
                tipo.setRazonSocialEmpresa(e.getEmpresa().getRazonSocial());
                tipo.setRucEmpresa(e.getEmpresa().getRuc());
            }
            response.getEmbarcaciones().add(tipo);
        }
        return response;
    }

    @PayloadRoot(namespace = NAMESPACE, localPart = "RegistrarEmbarcacionRequest")
    @ResponsePayload
    @SoapAction("RegistrarEmbarcacion")
    public RegistrarEmbarcacionResponse registrarEmbarcacion(@RequestPayload RegistrarEmbarcacionRequest request) {
        Embarcacion embarcacion = new Embarcacion();
        embarcacion.setNombreEmbarcacion(request.getNombreEmbarcacion());
        embarcacion.setMatricula(request.getMatricula());
        embarcacion.setPuertoBase(request.getPuertoBase());
        embarcacion.setCapacidadToneladas(request.getCapacidadToneladas());
        embarcacion.setNombreCapitan(request.getNombreCapitan());
        embarcacion.setLicenciaCapitan(request.getLicenciaCapitan());

        if (request.getIdEmpresa() != null) {
            Optional<Empresa> empresa = empresaRepository.findById(request.getIdEmpresa());
            empresa.ifPresent(embarcacion::setEmpresa);
        }

        Embarcacion saved = repository.save(embarcacion);

        RegistrarEmbarcacionResponse response = new RegistrarEmbarcacionResponse();
        response.setId(saved.getId());
        response.setMensaje("Embarcacion registrada exitosamente");
        return response;
    }

    @PayloadRoot(namespace = NAMESPACE, localPart = "ValidarEstadoEmbarcacionRequest")
    @ResponsePayload
    @SoapAction("ValidarEstadoEmbarcacion")
    public ValidarEstadoEmbarcacionResponse validarEstado(@RequestPayload ValidarEstadoEmbarcacionRequest request) {
        ValidarEstadoEmbarcacionResponse response = new ValidarEstadoEmbarcacionResponse();

        Optional<Embarcacion> emb = repository.findByMatricula(request.getMatricula());
        if (emb.isPresent()) {
            Embarcacion e = emb.get();
            response.setMatricula(e.getMatricula());
            response.setNombreEmbarcacion(e.getNombreEmbarcacion());
            response.setPuertoBase(e.getPuertoBase());
            response.setEstado(e.getEstado());
            response.setHabilitada("ACTIVA".equals(e.getEstado()));
            response.setMensaje("Embarcacion " + e.getEstado().toLowerCase());
            if (e.getEmpresa() != null) {
                response.setIdEmpresa(e.getEmpresa().getId());
                response.setRazonSocialEmpresa(e.getEmpresa().getRazonSocial());
                response.setRucEmpresa(e.getEmpresa().getRuc());
            }
        } else {
            response.setMatricula(request.getMatricula());
            response.setHabilitada(false);
            response.setMensaje("Embarcacion no encontrada");
        }
        return response;
    }
}
