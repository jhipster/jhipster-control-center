package tech.jhipster.controlcenter.config.gateway;

import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.cloud.gateway.route.RouteDefinitionLocator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayRouterConfiguration {
    private DiscoveryClient discoveryClient;

    public GatewayRouterConfiguration(DiscoveryClient discoveryClient) {
        this.discoveryClient = discoveryClient;
    }

    @Bean
    public RouteDefinitionLocator jhipsterCompanionRouteDefinitionLocator(DiscoveryClient discoveryClient) {
        return new JHipsterControlCenterRouteDefinitionLocator(discoveryClient);
    }
}
