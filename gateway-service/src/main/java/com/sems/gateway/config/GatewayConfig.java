package com.sems.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.web.reactive.function.server.RouterFunction;
import org.springframework.web.reactive.function.server.RouterFunctions;
import org.springframework.web.reactive.function.server.ServerResponse;
import reactor.core.publisher.Mono;

@Configuration
public class GatewayConfig {

    @Bean
    @Primary
    public RouterFunction<ServerResponse> healthRoute() {
        return RouterFunctions.route()
            .GET("/health", request -> ServerResponse.ok().bodyValue("Gateway is healthy"))
            .build();
    }
} 