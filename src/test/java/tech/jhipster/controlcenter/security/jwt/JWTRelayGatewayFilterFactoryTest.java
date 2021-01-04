/*
 * Copyright 2020-2021 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package tech.jhipster.controlcenter.security.jwt;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

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
import tech.jhipster.config.JHipsterProperties;
import tech.jhipster.controlcenter.security.AuthoritiesConstants;

public class JWTRelayGatewayFilterFactoryTest {

    private final TokenProvider tokenProvider;
    private final GatewayFilterChain filterChain = mock(GatewayFilterChain.class);
    private final ArgumentCaptor<ServerWebExchange> captor = ArgumentCaptor.forClass(ServerWebExchange.class);
    public static final String AUTHORIZATION_HEADER = "Authorization";

    JWTRelayGatewayFilterFactoryTest() {
        String base64Secret = "fd54a45s65fds737b9aafcb3412e07ed99b267f33413274720ddbb7f6c5e64e9f14075f2d7ed041592f0b7657baf8";
        JHipsterProperties jHipsterProperties = new JHipsterProperties();
        jHipsterProperties.getSecurity().getAuthentication().getJwt().setBase64Secret(base64Secret);
        tokenProvider = new TokenProvider(jHipsterProperties);
        ReflectionTestUtils.setField(tokenProvider, "key", Keys.hmacShaKeyFor(Decoders.BASE64.decode(base64Secret)));

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
            .get(sample_url)
            .header(JWTFilter.AUTHORIZATION_HEADER, "Bearer " + jwt)
            .build();

        // apply the filter to the request
        ServerWebExchange exchange = MockServerWebExchange.from(request);
        JWTRelayGatewayFilterFactory factory = new JWTRelayGatewayFilterFactory(tokenProvider);
        Config config = new Config();
        GatewayFilter filter = factory.apply(config);

        filter.filter(exchange, filterChain);
        // replace by the commented next line for reactive methods
        // filter.filter(exchange, filterChain).block();

        // intercept the request after filter
        ServerHttpRequest requestAfterFilter = captor.getValue().getRequest();

        assertEquals(request.getHeaders().getFirst(AUTHORIZATION_HEADER), requestAfterFilter.getHeaders().getFirst(AUTHORIZATION_HEADER));
    }

    @Test
    void applyFilterWithWrongTokenTest() {
        String sample_url = "/gateway/service-id/service-id:number/api/test";
        String jwt = "wrong-token";
        MockServerHttpRequest request = MockServerHttpRequest.get(sample_url).header(JWTFilter.AUTHORIZATION_HEADER, jwt).build();

        Throwable exceptionThrown = assertThrows(
            IllegalArgumentException.class,
            () -> {
                // apply the filter to the request
                ServerWebExchange exchange = MockServerWebExchange.from(request);
                JWTRelayGatewayFilterFactory factory = new JWTRelayGatewayFilterFactory(tokenProvider);
                Config config = new Config();
                GatewayFilter filter = factory.apply(config);
                filter.filter(exchange, filterChain);
            }
        );

        assertEquals(exceptionThrown.getMessage(), "Invalid token in Authorization header");
    }

    public static class Config {}
}
