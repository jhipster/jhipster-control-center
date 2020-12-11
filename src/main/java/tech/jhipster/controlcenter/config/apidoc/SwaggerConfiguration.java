package tech.jhipster.controlcenter.config.apidoc;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.cloud.gateway.route.Route;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuple2;
import springfox.documentation.oas.annotations.EnableOpenApi;
import springfox.documentation.swagger.web.SwaggerResource;
import springfox.documentation.swagger.web.SwaggerResourcesProvider;
import tech.jhipster.config.JHipsterConstants;

/**
 * jhcc-custom
 * Retrieves all registered microservices Swagger resources.
 */
@Component
@Primary
@Profile(JHipsterConstants.SPRING_PROFILE_API_DOCS)
@Configuration
@EnableOpenApi
public class SwaggerConfiguration implements SwaggerResourcesProvider {

    private final RouteLocator routeLocator;

    @Qualifier("swaggerResources")
    private final SwaggerResourcesProvider controlCenterSwaggerResources;

    public SwaggerConfiguration(RouteLocator routeLocator, SwaggerResourcesProvider swaggerResources) {
        this.routeLocator = routeLocator;
        this.controlCenterSwaggerResources = swaggerResources;
    }

    @Override
    public List<SwaggerResource> get() {
        // Get control center swagger resources and make their names more explicit
        List<SwaggerResource> allSwaggerResources = controlCenterSwaggerResources.get();
        allSwaggerResources.get(0).setName(String.format("jhipster-control-center (%s)", allSwaggerResources.get(0).getName()));
        allSwaggerResources.get(1).setName(String.format("jhipster-control-center (%s)", allSwaggerResources.get(1).getName()));

        List<Tuple2<Route, List<SwaggerResource>>> servicesRouteSwaggerResources = routeLocator
            .getRoutes()
            .flatMap(
                route -> {
                    // Retrieve the list of available OpenAPI resources for each service from their /swagger-resources endpoint
                    WebClient serviceClient = WebClient.builder().baseUrl(route.getUri().toString()).build();
                    Mono<List<SwaggerResource>> swaggerResources = serviceClient
                        .get()
                        .uri("/swagger-resources")
                        .retrieve()
                        .bodyToFlux(SwaggerResource.class)
                        .collectList();
                    return Mono.just(route).zipWith(swaggerResources);
                }
            )
            .collectList()
            .blockOptional()
            .orElse(Collections.emptyList());

        //Add the registered microservices swagger docs as additional swagger resources
        List<SwaggerResource> servicesSwaggerResources = servicesRouteSwaggerResources
            .stream()
            .map(
                tuple -> {
                    Route route = tuple.getT1();
                    String routePredicate = route.getPredicate().toString();
                    List<SwaggerResource> swaggerResources = tuple.getT2();
                    List<SwaggerResource> swaggerResourcesFinal = new ArrayList<>();
                    for (SwaggerResource swaggerResource : swaggerResources) {
                        String patchedSwaggerPath = routePredicate
                            .substring(routePredicate.indexOf("[") + 1, routePredicate.indexOf("]"))
                            .replace("/**", swaggerResource.getUrl());
                        swaggerResource.setName(route.getId() + " (" + swaggerResource.getName() + ")");
                        swaggerResource.setUrl(patchedSwaggerPath);
                        swaggerResourcesFinal.add(swaggerResource);
                    }
                    return swaggerResourcesFinal;
                }
            )
            .flatMap(Collection::stream)
            .collect(Collectors.toList());

        allSwaggerResources.addAll(servicesSwaggerResources);
        return allSwaggerResources;
    }
}
