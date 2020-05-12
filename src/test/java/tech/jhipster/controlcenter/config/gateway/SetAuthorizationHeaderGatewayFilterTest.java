package tech.jhipster.controlcenter.config.gateway;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import io.github.jhipster.config.JHipsterProperties;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.util.Collections;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import tech.jhipster.controlcenter.security.AuthoritiesConstants;
import tech.jhipster.controlcenter.security.jwt.JWTFilter;
import tech.jhipster.controlcenter.security.jwt.TokenProvider;

public class SetAuthorizationHeaderGatewayFilterTest {
    private final TokenProvider tokenProvider;
    private final GatewayFilterChain filterChain = mock(GatewayFilterChain.class);
    private final ArgumentCaptor<ServerWebExchange> captor = ArgumentCaptor.forClass(ServerWebExchange.class);
    public static final String AUTHORIZATION_HEADER = "Authorization";

    SetAuthorizationHeaderGatewayFilterTest() {
        JHipsterProperties jHipsterProperties = new JHipsterProperties();
        tokenProvider = new TokenProvider(jHipsterProperties);
        ReflectionTestUtils.setField(
            tokenProvider,
            "key",
            Keys.hmacShaKeyFor(
                Decoders.BASE64.decode("fd54a45s65fds737b9aafcb3412e07ed99b267f33413274720ddbb7f6c5e64e9f14075f2d7ed041592f0b7657baf8")
            )
        );

        ReflectionTestUtils.setField(tokenProvider, "tokenValidityInMilliseconds", 60000);
    }

    @BeforeEach
    void setup() {
        when(filterChain.filter(captor.capture())).thenReturn(Mono.empty());
    }

    @Test
    void applyFilterTest() {
        // create authentication
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
            "test-user",
            "test-password",
            Collections.singletonList(new SimpleGrantedAuthority(AuthoritiesConstants.USER))
        );

        // dummy api url to filter
        String sample_url = "/gateway/service-id/service-id:number/api/test";

        // create request with jwt in header
        String jwt = tokenProvider.createToken(authentication, false);
        MockServerHttpRequest request = MockServerHttpRequest
            .get("/api/test")
            .header(JWTFilter.AUTHORIZATION_HEADER, "Bearer " + jwt)
            .build();

        // apply the filter to the request
        ServerWebExchange exchange = MockServerWebExchange.from(request);
        SetAuthorizationHeaderGatewayFilterFactory factory = new SetAuthorizationHeaderGatewayFilterFactory(tokenProvider);
        Config config = new Config();
        GatewayFilter filter = factory.apply(config);

        filter.filter(exchange, filterChain);
        // replace by the commented next line for reactive methods
        // filter.filter(exchange, filterChain).block();

        // intercept the request after filter
        ServerHttpRequest requestAfterFilter = captor.getValue().getRequest();

        assertEquals(request.getHeaders().getFirst(AUTHORIZATION_HEADER), requestAfterFilter.getHeaders().getFirst(AUTHORIZATION_HEADER));
    }

    public static class Config {}
}
