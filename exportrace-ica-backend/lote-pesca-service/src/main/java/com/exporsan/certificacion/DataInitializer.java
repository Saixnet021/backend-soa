package com.exporsan.certificacion;

import com.exporsan.certificacion.model.TramiteSanipes;
import com.exporsan.certificacion.repository.TramiteSanipesRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component("certDataInitializer")
public class DataInitializer implements CommandLineRunner {

    private final TramiteSanipesRepository tramiteSanipesRepository;

    public DataInitializer(TramiteSanipesRepository tramiteSanipesRepository) {
        this.tramiteSanipesRepository = tramiteSanipesRepository;
    }

    @Override
    public void run(String... args) {
        if (tramiteSanipesRepository.count() == 0) {
            TramiteSanipes tramite1 = new TramiteSanipes();
            tramite1.setIdLote(1L);
            tramite1.setFechaSolicitud(LocalDateTime.now().minusDays(5));
            tramite1.setEstadoTramite("APROBADO");
            tramite1.setNumeroCertificado("CERT-2026-1-1234");
            tramite1.setFechaAprobacion(LocalDateTime.now().minusDays(5));
            tramiteSanipesRepository.save(tramite1);

            TramiteSanipes tramite2 = new TramiteSanipes();
            tramite2.setIdLote(4L);
            tramite2.setFechaSolicitud(LocalDateTime.now().minusDays(3));
            tramite2.setEstadoTramite("APROBADO");
            tramite2.setNumeroCertificado("CERT-2026-4-5678");
            tramite2.setFechaAprobacion(LocalDateTime.now().minusDays(3));
            tramiteSanipesRepository.save(tramite2);
        }
    }
}
