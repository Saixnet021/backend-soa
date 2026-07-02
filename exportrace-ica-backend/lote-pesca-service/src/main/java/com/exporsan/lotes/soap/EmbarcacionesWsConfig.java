package com.exporsan.lotes.soap;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.ws.config.annotation.WsConfigurerAdapter;
import org.springframework.ws.wsdl.wsdl11.DefaultWsdl11Definition;
import org.springframework.xml.xsd.SimpleXsdSchema;
import org.springframework.xml.xsd.XsdSchema;

@Configuration
public class EmbarcacionesWsConfig extends WsConfigurerAdapter {

    @Bean
    public XsdSchema embarcacionesSchema() {
        return new SimpleXsdSchema(new org.springframework.core.io.ClassPathResource("embarcaciones.xsd"));
    }

    @Bean
    public DefaultWsdl11Definition defaultWsdl11Definition(XsdSchema embarcacionesSchema) {
        DefaultWsdl11Definition definition = new DefaultWsdl11Definition();
        definition.setPortTypeName("EmbarcacionesPort");
        definition.setLocationUri("/ws");
        definition.setTargetNamespace("http://exporsan.com/embarcaciones");
        definition.setSchema(embarcacionesSchema);
        return definition;
    }
}
