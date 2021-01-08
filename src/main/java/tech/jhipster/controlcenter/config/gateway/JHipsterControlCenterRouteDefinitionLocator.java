package tech.jhipster.controlcenter.config.gateway;

import static org.springframework.cloud.gateway.filter.factory.RewritePathGatewayFilterFactory.REPLACEMENT_KEY;
import static org.springframework.cloud.gateway.handler.predicate.HeaderRoutePredicateFactory.REGEXP_KEY;
import static org.springframework.cloud.gateway.handler.predicate.RoutePredicateFactory.PATTERN_KEY;
import static org.springframework.cloud.gateway.support.NameUtils.normalizeFilterFactoryName;
import static org.springframework.cloud.gateway.support.NameUtils.normalizeRoutePredicateName;

import java.util.Optional;
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.cloud.gateway.discovery.DiscoveryClientRouteDefinitionLocator;
import org.springframework.cloud.gateway.filter.FilterDefinition;
import org.springframework.cloud.gateway.filter.factory.RewritePathGatewayFilterFactory;
import org.springframework.cloud.gateway.handler.predicate.PathRoutePredicateFactory;
import org.springframework.cloud.gateway.handler.predicate.PredicateDefinition;
import org.springframework.cloud.gateway.route.RouteDefinition;
import org.springframework.cloud.gateway.route.RouteDefinitionLocator;
import reactor.core.publisher.Flux;

/**
 * Dynamic Route Locator based on DiscoveryClient but that expose a route for each individual instances
 * rather than load balancing among instances of the same service
 * <p>
 * Inspired by the default DiscoveryClientRouteDefinitionLocator
 *
 * @see org.springframework.cloud.gateway.discovery.DiscoveryClientRouteDefinitionLocator
 */
public class JHipsterControlCenterRouteDefinitionLocator implements RouteDefinitionLocator {
    public static final String GATEWAY_PATH = "/gateway/";

    private final DiscoveryClient discoveryClient;

    public JHipsterControlCenterRouteDefinitionLocator(DiscoveryClient discoveryClient) {
        this.discoveryClient = discoveryClient;
    }

    @Override
    public Flux<RouteDefinition> getRouteDefinitions() {
        return Flux
            .fromIterable(discoveryClient.getServices())
            .map(discoveryClient::getInstances)
            .filter(instances -> !instances.isEmpty())
            .map(instances -> instances.get(0))
            .map(JHipsterControlCenterRouteDefinitionLocator::getRouteDefinitionForInstance);
    }

    private static RouteDefinition getRouteDefinitionForInstance(ServiceInstance instance) {
        String instanceRoute = String
            .format("%s/%s", instance.getServiceId(), Optional.ofNullable(instance.getInstanceId()).orElse(instance.getServiceId()))
            .toLowerCase();

        RouteDefinition routeDefinition = new RouteDefinition();
        routeDefinition.setId(instanceRoute);
        routeDefinition.setUri(instance.getUri());

        // add a predicate that matches the url at /gateway/$instanceRoute/**
        PredicateDefinition predicate = new PredicateDefinition();
        predicate.setName(normalizeRoutePredicateName(PathRoutePredicateFactory.class));
        predicate.addArg(PATTERN_KEY, GATEWAY_PATH + instanceRoute + "/**");
        routeDefinition.getPredicates().add(predicate);

        // add a filter that remove /gateway/$instanceRoute/ in downstream service call path
        FilterDefinition filter = new FilterDefinition();
        filter.setName(normalizeFilterFactoryName(RewritePathGatewayFilterFactory.class));
        String regex = GATEWAY_PATH + instanceRoute + "/(?<remaining>.*)";
        String replacement = "/${remaining}";
        filter.addArg(REGEXP_KEY, regex);
        filter.addArg(REPLACEMENT_KEY, replacement);
        routeDefinition.getFilters().add(filter);

        return routeDefinition;
    }
}
