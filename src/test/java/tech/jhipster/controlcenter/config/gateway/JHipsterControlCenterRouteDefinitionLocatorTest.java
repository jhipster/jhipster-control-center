package tech.jhipster.controlcenter.config.gateway;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.net.URI;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.cloud.client.DefaultServiceInstance;
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.cloud.gateway.route.RouteDefinition;

class JHipsterControlCenterRouteDefinitionLocatorTest {

    @Test
    void shouldReturnRouteDefinitionsForAllInstancesOfEachService() {
        DiscoveryClient discoveryClient = mock(DiscoveryClient.class);

        ServiceInstance instance1 = new DefaultServiceInstance("gateway:instance-1", "gateway", "localhost", 8080, false);
        ServiceInstance instance2 = new DefaultServiceInstance("gateway:instance-2", "gateway", "localhost", 8081, false);
        ServiceInstance singleInstance = new DefaultServiceInstance(null, "user-service", "localhost", 8082, false);

        when(discoveryClient.getServices()).thenReturn(List.of("gateway", "empty-service", "user-service"));
        when(discoveryClient.getInstances("gateway")).thenReturn(List.of(instance1, instance2));
        when(discoveryClient.getInstances("empty-service")).thenReturn(Collections.emptyList());
        when(discoveryClient.getInstances("user-service")).thenReturn(List.of(singleInstance));

        JHipsterControlCenterRouteDefinitionLocator locator = new JHipsterControlCenterRouteDefinitionLocator(discoveryClient);

        List<RouteDefinition> routes = locator.getRouteDefinitions().collectList().block();

        assertThat(routes).hasSize(3);
        assertThat(routes)
            .extracting(RouteDefinition::getId)
            .containsExactly("gateway/gateway:instance-1", "gateway/gateway:instance-2", "user-service/user-service");
        assertThat(routes)
            .extracting(RouteDefinition::getUri)
            .containsExactly(URI.create("http://localhost:8080"), URI.create("http://localhost:8081"), URI.create("http://localhost:8082"));
    }
}
