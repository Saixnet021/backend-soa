package com.exporsan.calidad;

import com.exporsan.calidad.model.AuditoriaCalidad;
import com.exporsan.calidad.model.ReglaCalidad;
import com.exporsan.calidad.repository.AuditoriaCalidadRepository;
import com.exporsan.calidad.repository.ReglaCalidadRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private final ReglaCalidadRepository reglaCalidadRepository;
    private final AuditoriaCalidadRepository auditoriaCalidadRepository;

    public DataInitializer(ReglaCalidadRepository reglaCalidadRepository,
                           AuditoriaCalidadRepository auditoriaCalidadRepository) {
        this.reglaCalidadRepository = reglaCalidadRepository;
        this.auditoriaCalidadRepository = auditoriaCalidadRepository;
    }

    @Override
    public void run(String... args) {
        if (reglaCalidadRepository.count() == 0) {
            ReglaCalidad r1 = new ReglaCalidad();
            r1.setCodigoEspecie("POTA");
            r1.setTempMinAlerta(-18.0);
            r1.setTempMaxAlerta(-15.0);
            r1.setAccionAlerta("EMAIL");
            reglaCalidadRepository.save(r1);

            ReglaCalidad r2 = new ReglaCalidad();
            r2.setCodigoEspecie("PERICO");
            r2.setTempMinAlerta(-18.0);
            r2.setTempMaxAlerta(-14.0);
            r2.setAccionAlerta("BLOQUEO_DESPACHO");
            reglaCalidadRepository.save(r2);

            ReglaCalidad r3 = new ReglaCalidad();
            r3.setCodigoEspecie("CABALLA");
            r3.setTempMinAlerta(-19.0);
            r3.setTempMaxAlerta(-15.0);
            r3.setAccionAlerta("EMAIL");
            reglaCalidadRepository.save(r3);
        }

        if (auditoriaCalidadRepository.count() == 0) {
            LocalDateTime now = LocalDateTime.now();

            AuditoriaCalidad a1 = new AuditoriaCalidad();
            a1.setIdLote(1L);
            a1.setIdInspector(2L);
            a1.setTimestampMedicion(now.minusHours(20));
            a1.setTemperaturaCelsius(-16.5);
            a1.setIdCamara("CAMARA-01");
            a1.setObservaciones("Lectura inicial");
            auditoriaCalidadRepository.save(a1);

            AuditoriaCalidad a2 = new AuditoriaCalidad();
            a2.setIdLote(1L);
            a2.setIdInspector(2L);
            a2.setTimestampMedicion(now.minusHours(16));
            a2.setTemperaturaCelsius(-15.8);
            a2.setIdCamara("TUNEL-02");
            a2.setObservaciones("Segunda lectura");
            auditoriaCalidadRepository.save(a2);

            AuditoriaCalidad a3 = new AuditoriaCalidad();
            a3.setIdLote(1L);
            a3.setIdInspector(2L);
            a3.setTimestampMedicion(now.minusHours(12));
            a3.setTemperaturaCelsius(-17.2);
            a3.setIdCamara("CAMARA-01");
            a3.setObservaciones("Tercera lectura");
            auditoriaCalidadRepository.save(a3);

            AuditoriaCalidad a4 = new AuditoriaCalidad();
            a4.setIdLote(1L);
            a4.setIdInspector(2L);
            a4.setTimestampMedicion(now.minusHours(8));
            a4.setTemperaturaCelsius(-16.0);
            a4.setIdCamara("TUNEL-02");
            a4.setObservaciones("Cuarta lectura");
            auditoriaCalidadRepository.save(a4);

            AuditoriaCalidad a5 = new AuditoriaCalidad();
            a5.setIdLote(1L);
            a5.setIdInspector(2L);
            a5.setTimestampMedicion(now.minusHours(4));
            a5.setTemperaturaCelsius(-16.8);
            a5.setIdCamara("CAMARA-01");
            a5.setObservaciones("Quinta lectura");
            auditoriaCalidadRepository.save(a5);
        }
    }
}
