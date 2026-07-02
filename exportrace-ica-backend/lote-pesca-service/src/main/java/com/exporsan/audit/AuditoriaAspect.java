package com.exporsan.audit;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import jakarta.servlet.http.HttpServletRequest;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Aspect
@Component
public class AuditoriaAspect {

    private final AuditoriaLogRepository auditoriaLogRepository;
    private final ObjectMapper objectMapper;

    @Value("${spring.application.name:lote-pesca-service}")
    private String servicio;

    @Autowired
    public AuditoriaAspect(AuditoriaLogRepository auditoriaLogRepository) {
        this.auditoriaLogRepository = auditoriaLogRepository;
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
        this.objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }

    @Around("@annotation(auditable)")
    public Object audit(ProceedingJoinPoint joinPoint, Auditable auditable) throws Throwable {
        AuditoriaLog log = new AuditoriaLog();
        log.setAccion(auditable.accion());
        log.setEntidad(auditable.entidad());
        log.setServicio(servicio);

        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getName() != null) {
                log.setUsuarioUsername(auth.getName());
            }
        } catch (Exception ignored) {
        }

        try {
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs != null) {
                HttpServletRequest request = attrs.getRequest();
                log.setIpOrigen(request.getRemoteAddr());
            }
        } catch (Exception ignored) {
        }

        try {
            Object[] args = joinPoint.getArgs();
            for (Object arg : args) {
                if (arg instanceof HasId hasId && hasId.getId() != null) {
                    log.setEntidadId(String.valueOf(hasId.getId()));
                    break;
                }
            }
        } catch (Exception ignored) {
        }

        Object result;
        try {
            result = joinPoint.proceed();
            log.setResultado("EXITO");
            if (result != null) {
                log.setValorNuevo(objectMapper.writeValueAsString(result));
            }
        } catch (Throwable ex) {
            log.setResultado("ERROR");
            log.setMensajeError(ex.getMessage());
            throw ex;
        } finally {
            try {
                auditoriaLogRepository.save(log);
            } catch (Exception ignored) {
            }
        }

        return result;
    }
}
