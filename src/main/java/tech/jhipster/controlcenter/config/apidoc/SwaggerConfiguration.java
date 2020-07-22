package tech.jhipster.controlcenter.config.apidoc;

import io.github.jhipster.config.JHipsterConstants;
import java.util.ArrayList;
import java.util.List;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import springfox.documentation.builders.PathSelectors;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spring.web.plugins.Docket;
import springfox.documentation.swagger.web.SwaggerResource;
import springfox.documentation.swagger.web.SwaggerResourcesProvider;
import springfox.documentation.swagger2.annotations.EnableSwagger2WebFlux;

/**
 * jhcc-custom
 * Retrieves all registered microservices Swagger resources.
 */
@Component
@Primary
@Profile(JHipsterConstants.SPRING_PROFILE_SWAGGER)
@Configuration
@EnableSwagger2WebFlux
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
        resources.add(swaggerResource("jhipster-control-center", "/v2/api-docs"));
        //Add the registered microservices swagger docs as additional swagger resources
        routeLocator
            .getRoutes()
            .collectList()
            .subscribe(
                routes -> {
                    routes.forEach(
                        route -> {
                            String predicate = route.getPredicate().toString();
                            if (!predicate.contains("consul")) {
                                String path = predicate.substring(predicate.indexOf("[") + 1, predicate.indexOf("]"));
                                resources.add(swaggerResource(route.getId(), path.replace("**", "v2/api-docs")));
                            }
                        }
                    );
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
