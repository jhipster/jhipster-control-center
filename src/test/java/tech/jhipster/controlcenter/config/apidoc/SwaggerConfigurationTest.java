package tech.jhipster.controlcenter.config.apidoc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.net.URI;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.cloud.gateway.handler.AsyncPredicate;
import org.springframework.cloud.gateway.route.Route;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.netty.DisposableServer;
import reactor.netty.http.server.HttpServer;
import springfox.documentation.swagger.web.SwaggerResource;
import springfox.documentation.swagger.web.SwaggerResourcesProvider;

class SwaggerConfigurationTest {

    private DisposableServer availableServer;
    private DisposableServer unresponsiveServer;

    @BeforeEach
    void setUp() {
        availableServer =
            HttpServer
                .create()
                .port(0)
                .route(
                    routes ->
                        routes.get(
                            "/swagger-resources",
                            (request, response) ->
                                response
                                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                                    .sendString(Mono.just("[{\"name\":\"default\",\"url\":\"/v3/api-docs\",\"swaggerVersion\":\"3.0\"}]"))
                        )
                )
                .bindNow();

        unresponsiveServer =
            HttpServer
                .create()
                .port(0)
                .route(
                    routes ->
                        routes.get(
                            "/swagger-resources",
                            (request, response) ->
                                response
                                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                                    .sendString(
                                        Mono
                                            .just("[{\"name\":\"slow\",\"url\":\"/v3/api-docs\",\"swaggerVersion\":\"3.0\"}]")
                                            .delayElement(Duration.ofSeconds(5))
                                    )
                        )
                )
                .bindNow();
    }

    @AfterEach
    void tearDown() {
        if (availableServer != null) {
            availableServer.disposeNow();
        }
        if (unresponsiveServer != null) {
            unresponsiveServer.disposeNow();
        }
    }

    @Test
    void shouldSkipUnavailableAndTimedOutServicesAndReturnAvailableSwaggerResources() {
        RouteLocator routeLocator = mock(RouteLocator.class);
        SwaggerResourcesProvider controlCenterProvider = mock(SwaggerResourcesProvider.class);

        SwaggerResource ccDefault = new SwaggerResource();
        ccDefault.setName("default");
        ccDefault.setUrl("/v3/api-docs");
        SwaggerResource ccManagement = new SwaggerResource();
        ccManagement.setName("management");
        ccManagement.setUrl("/v3/api-docs?group=management");
        List<SwaggerResource> ccResources = new ArrayList<>();
        ccResources.add(ccDefault);
        ccResources.add(ccManagement);
        when(controlCenterProvider.get()).thenReturn(ccResources);

        Route availableRoute = createRoute(
            "service-a/instance-a",
            "http://127.0.0.1:" + availableServer.port(),
            "Paths: [/gateway/service-a/instance-a/**], match trailing slash: true"
        );
        Route slowRoute = createRoute(
            "service-slow/instance-slow",
            "http://127.0.0.1:" + unresponsiveServer.port(),
            "Paths: [/gateway/service-slow/instance-slow/**], match trailing slash: true"
        );
        Route unreachableRoute = createRoute(
            "service-down/instance-down",
            "http://127.0.0.1:1",
            "Paths: [/gateway/service-down/instance-down/**], match trailing slash: true"
        );

        when(routeLocator.getRoutes()).thenReturn(Flux.just(availableRoute, slowRoute, unreachableRoute));

        SwaggerConfiguration swaggerConfiguration = new SwaggerConfiguration(routeLocator, controlCenterProvider);
        swaggerConfiguration.setSwaggerResourceTimeout(Duration.ofSeconds(2));

        List<SwaggerResource> result = swaggerConfiguration.get();

        assertThat(result).hasSize(3);
        assertThat(result)
            .extracting(SwaggerResource::getName)
            .containsExactly("jhipster-control-center (default)", "jhipster-control-center (management)", "service-a/instance-a (default)");
        assertThat(result.get(2).getUrl()).isEqualTo("/gateway/service-a/instance-a/v3/api-docs");
    }

    private Route createRoute(String id, String uri, String predicateDescription) {
        AsyncPredicate<ServerWebExchange> predicate = new AsyncPredicate<ServerWebExchange>() {
            @Override
            public org.reactivestreams.Publisher<Boolean> apply(ServerWebExchange exchange) {
                return Mono.just(true);
            }

            @Override
            public String toString() {
                return predicateDescription;
            }
        };
        return Route.async().id(id).uri(URI.create(uri)).asyncPredicate(predicate).build();
    }
}
