package com.exporsan.audit;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class AuditoriaAspect {

    private final AuditoriaLogRepository auditoriaLogRepository;
    private final ObjectMapper objectMapper;

    @Value("${spring.application.name:monitoreo-cold-service}")
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
        log.setTimestamp(java.time.LocalDateTime.now());

        Object[] args = joinPoint.getArgs();
        if (args.length > 0 && args[0] instanceof HasId hasId) {
            log.setEntidadId(hasId.getId() != null ? String.valueOf(hasId.getId()) : null);
        }

        try {
            Object result = joinPoint.proceed();
            log.setResultado("EXITO");
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
