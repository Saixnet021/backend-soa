package com.exporsan.audit;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class AuditoriaAspect {

    private final AuditoriaLogRepository repository;
    private final ObjectMapper objectMapper;

    @Value("${spring.application.name:auth-service}")
    private String servicio;

    public AuditoriaAspect(AuditoriaLogRepository repository, ObjectMapper objectMapper) {
        this.repository = repository;
        this.objectMapper = objectMapper;
    }

    @Around("@annotation(auditable)")
    public Object auditarOperacion(ProceedingJoinPoint joinPoint, Auditable auditable) throws Throwable {
        AuditoriaLog log = new AuditoriaLog();
        log.setAccion(auditable.accion());
        log.setEntidad(auditable.entidad());
        log.setServicio(servicio);
        log.setUsuarioUsername("sistema");

        try {
            Object result = joinPoint.proceed();
            log.setResultado("EXITO");
            if (result != null) {
                try {
                    log.setValorNuevo(objectMapper.writeValueAsString(result));
                    if (result instanceof HasId) {
                        log.setEntidadId(String.valueOf(((HasId) result).getId()));
                    }
                } catch (Exception ignored) {}
            }
            repository.save(log);
            return result;
        } catch (Throwable ex) {
            log.setResultado("ERROR");
            log.setMensajeError(ex.getMessage());
            repository.save(log);
            throw ex;
        }
    }
}
