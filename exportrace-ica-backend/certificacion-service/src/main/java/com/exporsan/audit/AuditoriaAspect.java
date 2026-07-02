package com.exporsan.audit;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Aspect
@Component
public class AuditoriaAspect {

    private final AuditoriaLogRepository auditoriaLogRepository;
    private final ObjectMapper objectMapper;

    @Value("${spring.application.name:certificacion-service}")
    private String servicio;

    public AuditoriaAspect(AuditoriaLogRepository auditoriaLogRepository, ObjectMapper objectMapper) {
        this.auditoriaLogRepository = auditoriaLogRepository;
        this.objectMapper = objectMapper;
    }

    @Around("@annotation(auditable)")
    public Object auditar(ProceedingJoinPoint joinPoint, Auditable auditable) throws Throwable {
        AuditoriaLog log = new AuditoriaLog();
        log.setAccion(auditable.accion());
        log.setEntidad(auditable.entidad());
        log.setServicio(servicio);
        log.setResultado("EXITO");

        Object[] args = joinPoint.getArgs();
        if (args != null) {
            for (Object arg : args) {
                if (arg instanceof HasId hasId && hasId.getId() != null) {
                    log.setEntidadId(String.valueOf(hasId.getId()));
                }
            }
        }

        try {
            Object result = joinPoint.proceed();

            if (result instanceof HasId hasId && hasId.getId() != null) {
                log.setEntidadId(String.valueOf(hasId.getId()));
            }
            if (result != null) {
                try {
                    log.setValorNuevo(objectMapper.writeValueAsString(result));
                } catch (Exception ignored) {
                }
            }

            auditoriaLogRepository.save(log);
            return result;

        } catch (Throwable ex) {
            log.setResultado("ERROR");
            log.setMensajeError(ex.getMessage());
            auditoriaLogRepository.save(log);
            throw ex;
        }
    }
}
