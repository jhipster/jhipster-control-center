package tech.jhipster.controlcenter.config.apidoc;

import io.github.jhipster.config.JHipsterConstants;
import java.util.ArrayList;
import java.util.List;
import org.springframework.cloud.gateway.route.Route;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import springfox.documentation.builders.PathSelectors;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spring.web.plugins.Docket;
import springfox.documentation.swagger.web.SwaggerResource;
import springfox.documentation.swagger.web.SwaggerResourcesProvider;
import springfox.documentation.swagger2.annotations.EnableSwagger2;

/**
 * jhcc-custom
 * Retrieves all registered microservices Swagger resources.
 */
@Component
@Primary
@Profile(JHipsterConstants.SPRING_PROFILE_SWAGGER)
@Configuration
@EnableSwagger2
public class SwaggerConfiguration implements SwaggerResourcesProvider {
    private final RouteLocator routeLocator;

    public SwaggerConfiguration(RouteLocator routeLocator) {
        this.routeLocator = routeLocator;
    }

    @Bean
    public Docket api() {
        return new Docket(DocumentationType.SWAGGER_2).select().apis(RequestHandlerSelectors.any()).paths(PathSelectors.any()).build();
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
            .collectList()
            .subscribe(
                routes -> {
                    routes.forEach(
                        route -> {
                            String routePredicate = route.getPredicate().toString();
                            // Ignore the Consul server from the list as it doesn't expose a /swagger-resources endpoint
                            if (routePredicate.contains("consul/consul")) {
                                return;
                            }

                            // Retrieve the list of available OpenAPI resources for each service from their /swagger-resources endpoint
                            WebClient serviceClient = WebClient.builder().baseUrl(route.getUri().toString()).build();
                            List<SwaggerResource> swaggerResources = serviceClient
                                .get()
                                .uri("/swagger-resources")
                                .retrieve()
                                .bodyToFlux(SwaggerResource.class)
                                .collectList()
                                .block();

                            for (SwaggerResource swaggerResource : swaggerResources) {
                                // Patch the swagger path to prepend the gateway proxy path
                                String patchedSwaggerPath = routePredicate
                                    .substring(routePredicate.indexOf("[") + 1, routePredicate.indexOf("]"))
                                    .replace("/**", swaggerResource.getUrl());

                                swaggerResource.setName(route.getId() + " (" + swaggerResource.getName() + ")");
                                swaggerResource.setUrl(patchedSwaggerPath);
                                resources.add(swaggerResource);
                            }
                        }
                    );
                }
            );
        return resources;
    }
}
