package tech.jhipster.controlcenter.config.gateway;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.GatewayFilterFactory;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;

@Component
public class SetAuthorizationHeaderGatewayFilterFactory implements GatewayFilterFactory<SetAuthorizationHeaderGatewayFilterFactory.Config> {

    @Autowired
    public SetAuthorizationHeaderGatewayFilterFactory() {}

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            String AUTHORIZATION_HEADER_VALUE = exchange.getRequest().getHeaders().getFirst("Authorization");
            ServerHttpRequest request = exchange
                .getRequest()
                .mutate()
                .headers(
                    httpHeaders -> {
                        httpHeaders.set(Config.AUTHORIZATION_HEADER, AUTHORIZATION_HEADER_VALUE);
                    }
                )
                .build();
            return chain.filter(exchange.mutate().request(request).build());
        };
    }

    @Override
    public Config newConfig() {
        return new Config();
    }

    @Override
    public Class<Config> getConfigClass() {
        return Config.class;
    }

    public static class Config {
        public static final String AUTHORIZATION_HEADER = "Authorization";
    }
}
