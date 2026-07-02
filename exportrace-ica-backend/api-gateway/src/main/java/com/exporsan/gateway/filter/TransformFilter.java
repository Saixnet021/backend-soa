package com.exporsan.gateway.filter;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class TransformFilter implements GlobalFilter, Ordered {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        
        String servicioHeader = request.getHeaders().getFirst("X-Servicio-Origen");
        if (servicioHeader == null) {
            servicioHeader = "gateway";
        }
        
        ServerHttpRequest modifiedRequest = request.mutate()
                .header("X-Gateway-Timestamp", String.valueOf(System.currentTimeMillis()))
                .header("X-Servicio-Origen", servicioHeader)
                .build();

        return chain.filter(exchange.mutate().request(modifiedRequest).build());
    }

    @Override
    public int getOrder() {
        return -1;
    }
}
