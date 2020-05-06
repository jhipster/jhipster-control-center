package tech.jhipster.controlcenter.config.swagger;

import io.github.jhipster.config.JHipsterConstants;
import org.springframework.cloud.gateway.route.Route;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import springfox.documentation.swagger.web.SwaggerResource;
import springfox.documentation.swagger.web.SwaggerResourcesProvider;
import springfox.documentation.swagger2.annotations.EnableSwagger2WebFlux;

import java.util.ArrayList;
import java.util.List;



/**
 * Retrieves all registered microservices Swagger resources.
 */
@Component
@Primary
@Profile(JHipsterConstants.SPRING_PROFILE_SWAGGER)
@Configuration
@EnableSwagger2WebFlux
public class SwaggerConfig implements SwaggerResourcesProvider {
    private final RouteLocator routeLocator;


    public SwaggerConfig(RouteLocator routeLocator) {
        this.routeLocator = routeLocator;
    }

    @Override
    public List<SwaggerResource> get() {
        List<SwaggerResource> resources = new ArrayList<>();

        //Add the registry swagger resource that correspond to the jhipster-control-center's own swagger doc
        resources.add(swaggerResource("jhipster-control-center", "/v2/api-docs"));

        //Add the registered microservices swagger docs as additional swagger resources
        List<Route> routes = routeLocator.getRoutes().collectList().block();

        assert routes != null;
        routes.forEach(
            route -> {
                if (!route.getId().contains("consul/consul")) {

                    String predicate = route
                        .getPredicate()
                        .toString();

                    String fullPath = predicate
                        .substring(predicate.indexOf("[") + 1, predicate.indexOf("]"))
                        .replace("**", "v2/api-docs");

                    resources.add(swaggerResource(route.getId(), fullPath));
                }
            }
        );

        return resources;
    }

    private SwaggerResource swaggerResource(String name, String location) {
        SwaggerResource swaggerResource = new SwaggerResource();
        swaggerResource.setName(name);
        swaggerResource.setLocation(location);
        swaggerResource.setSwaggerVersion("2.0");
        return swaggerResource;
    }
}
