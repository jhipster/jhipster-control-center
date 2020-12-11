package tech.jhipster.controlcenter.config.apidoc;

import java.util.ArrayList;
import java.util.List;
import org.springframework.cloud.gateway.route.Route;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuple2;
import springfox.documentation.swagger.web.SwaggerResource;
import springfox.documentation.swagger.web.SwaggerResourcesProvider;
import springfox.documentation.swagger2.annotations.EnableSwagger2;
import tech.jhipster.config.JHipsterConstants;

/**
 * jhcc-custom
 * Retrieves all registered microservices Swagger resources.
 */
@Component
@Primary
@Profile(JHipsterConstants.SPRING_PROFILE_API_DOCS)
@Configuration
@EnableSwagger2
public class SwaggerConfiguration implements SwaggerResourcesProvider {

    private final RouteLocator routeLocator;

    public SwaggerConfiguration(RouteLocator routeLocator) {
        this.routeLocator = routeLocator;
    }

    @Override
    public List<SwaggerResource> get() {
        List<SwaggerResource> resources = new ArrayList<>();
        SwaggerResource controlCenterSwaggerResource = new SwaggerResource();
        controlCenterSwaggerResource.setName("jhipster-control-center");
        controlCenterSwaggerResource.setLocation("/v2/api-docs");
        controlCenterSwaggerResource.setSwaggerVersion("2.0");
        resources.add(controlCenterSwaggerResource);

        //Add the registered microservices swagger docs as additional swagger resources
        routeLocator
            .getRoutes()
            .filterWhen(
                route -> {
                    String routePredicate = route.getPredicate().toString();
                    // Ignore the Consul server from the list as it doesn't expose a /swagger-resources endpoint
                    return Mono.just(!routePredicate.contains("consul/consul"));
                }
            )
            .flatMap(
                route -> {
                    // Retrieve the list of available OpenAPI resources for each service from their /swagger-resources endpoint
                    WebClient serviceClient = WebClient.builder().baseUrl(route.getUri().toString()).build();
                    Mono<Tuple2<List<SwaggerResource>, Route>> tuple = serviceClient
                        .get()
                        .uri("/swagger-resources")
                        .retrieve()
                        .bodyToFlux(SwaggerResource.class)
                        .collectList()
                        .zipWith(Mono.just(route));
                    tuple.switchIfEmpty(Mono.error(new Exception().getCause()));
                    tuple.subscribe(
                        T -> {
                            // Patch the swagger path to prepend the gateway proxy path
                            String routePredicate = route.getPredicate().toString();
                            List<SwaggerResource> swaggerResources = T.getT1();
                            for (SwaggerResource swaggerResource : swaggerResources) {
                                String patchedSwaggerPath = routePredicate
                                    .substring(routePredicate.indexOf("[") + 1, routePredicate.indexOf("]"))
                                    .replace("/**", swaggerResource.getUrl());

                                swaggerResource.setName(route.getId() + " (" + swaggerResource.getName() + ")");
                                swaggerResource.setUrl(patchedSwaggerPath);
                                resources.add(swaggerResource);
                            }
                        }
                    );
                    return tuple;
                }
            )
            .subscribe();

        return resources;
    }
}
