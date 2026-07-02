package com.exporsan.gateway.filter;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class RateLimitFilter implements GlobalFilter, Ordered {

    private final Map<String, RateInfo> requestCounts = new ConcurrentHashMap<>();

    private static class RateInfo {
        AtomicInteger count = new AtomicInteger(0);
        long windowStart = System.currentTimeMillis();
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String clientIp = exchange.getRequest().getRemoteAddress() != null
                ? exchange.getRequest().getRemoteAddress().getAddress().getHostAddress()
                : "unknown";

        RateInfo info = requestCounts.computeIfAbsent(clientIp, k -> new RateInfo());
        long now = System.currentTimeMillis();

        if (now - info.windowStart > 1000) {
            info.count.set(0);
            info.windowStart = now;
        }

        if (info.count.incrementAndGet() > 10) {
            exchange.getResponse().setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
            exchange.getResponse().getHeaders().add("X-RateLimit-Retry-After-Seconds", "1");
            return exchange.getResponse().setComplete();
        }

        exchange.getResponse().getHeaders().add("X-RateLimit-Limit", "10");
        exchange.getResponse().getHeaders().add("X-RateLimit-Remaining", String.valueOf(Math.max(0, 10 - info.count.get())));

        return chain.filter(exchange);
    }

    @Override
    public int getOrder() {
        return 0;
    }
}
