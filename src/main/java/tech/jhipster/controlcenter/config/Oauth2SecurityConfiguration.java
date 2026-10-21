package tech.jhipster.controlcenter.config;

import static org.springframework.security.web.server.util.matcher.ServerWebExchangeMatchers.pathMatchers;

import com.nimbusds.openid.connect.sdk.op.OIDCProviderMetadata;
import java.net.URI;
import java.util.HashSet;
import java.util.Set;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Profile;
import org.springframework.core.convert.converter.Converter;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.annotation.method.configuration.EnableReactiveMethodSecurity;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.SecurityWebFiltersOrder;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcReactiveOAuth2UserService;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.InMemoryReactiveClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.ReactiveClientRegistrationRepository;
import org.springframework.security.oauth2.client.userinfo.ReactiveOAuth2UserService;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUserAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusReactiveJwtDecoder;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoders;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtAuthenticationConverterAdapter;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.csrf.CookieServerCsrfTokenRepository;
import org.springframework.security.web.server.header.ReferrerPolicyServerHttpHeadersWriter;
import org.springframework.security.web.server.util.matcher.NegatedServerWebExchangeMatcher;
import org.springframework.security.web.server.util.matcher.OrServerWebExchangeMatcher;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;
import org.zalando.problem.spring.webflux.advice.security.SecurityProblemSupport;
import reactor.core.publisher.Mono;
import tech.jhipster.config.JHipsterProperties;
import tech.jhipster.controlcenter.security.AuthoritiesConstants;
import tech.jhipster.controlcenter.security.SecurityUtils;
import tech.jhipster.controlcenter.security.jwt.JWTFilter;
import tech.jhipster.controlcenter.security.jwt.TokenProvider;
import tech.jhipster.controlcenter.web.filter.SpaWebFilter;
import tech.jhipster.web.filter.reactive.CookieCsrfFilter;

@EnableWebFluxSecurity
@EnableReactiveMethodSecurity
@Import(SecurityProblemSupport.class)
@Profile(Constants.PROFILE_OAUTH2)
public class Oauth2SecurityConfiguration {

    @Value("${spring.security.oauth2.client.provider.oidc.issuer-uri}")
    private String issuerUri;

    @Value("${spring.security.oauth2.client.registration.oidc.client-id}")
    private String clientId;

    @Value("${spring.security.oauth2.client.registration.oidc.client-secret}")
    private String clientSecret;

    @Value("${spring.security.oauth2.client.registration.oidc.scope}")
    private String[] scope;

    private final TokenProvider tokenProvider;

    private final JHipsterProperties jHipsterProperties;

    private final SecurityProblemSupport problemSupport;

    private OIDCProviderMetadata providerMetadata;

    public Oauth2SecurityConfiguration(
        TokenProvider tokenProvider,
        JHipsterProperties jHipsterProperties,
        SecurityProblemSupport problemSupport
    ) {
        this.tokenProvider = tokenProvider;
        this.jHipsterProperties = jHipsterProperties;
        this.problemSupport = problemSupport;
    }

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        // @formatter:off
        http
            .securityMatcher(
                new NegatedServerWebExchangeMatcher(
                    new OrServerWebExchangeMatcher(
                        pathMatchers("/app/**", "/i18n/**", "/content/**", "/swagger-ui/**", "/swagger-resources/**", "/v2/api-docs", "/v3/api-docs", "/test/**"),
                        pathMatchers(HttpMethod.OPTIONS, "/**")
                    )
                )
            )
            .addFilterAt(new CookieCsrfFilter(), SecurityWebFiltersOrder.REACTOR_CONTEXT)
            .addFilterAt(new SpaWebFilter(), SecurityWebFiltersOrder.AUTHENTICATION)
            .addFilterAt(new JWTFilter(tokenProvider), SecurityWebFiltersOrder.HTTP_BASIC)
            .exceptionHandling()
                .accessDeniedHandler(problemSupport)
                .authenticationEntryPoint(problemSupport)
            .and()
                .headers()
                    .contentSecurityPolicy("default-src 'self'; frame-src 'self' data:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://storage.googleapis.com https://www.google-analytics.com; style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; img-src 'self' data: https://www.google-analytics.com; font-src 'self' https://fonts.gstatic.com data:")
                .and()
                    .referrerPolicy(ReferrerPolicyServerHttpHeadersWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN)
                .and()
                    .featurePolicy("geolocation 'none'; midi 'none'; sync-xhr 'none'; microphone 'none'; camera 'none'; magnetometer 'none'; gyroscope 'none'; fullscreen 'self'; payment 'none'")
                .and()
                    .frameOptions().disable();

        // Require authentication for all requests
        http
            .authorizeExchange()
            .pathMatchers("/").permitAll()
            .pathMatchers("/*.*").permitAll()
            .pathMatchers("/api/authenticate").permitAll()
            .pathMatchers("/api/auth-info").permitAll()
            .pathMatchers("/api/**").authenticated()
            .pathMatchers("/services/**").authenticated()
            // jhcc-custom : begin
            .pathMatchers("/gateway/**").authenticated()
            .pathMatchers("/v3/api-docs", "/swagger-ui/index.html").permitAll()
            .pathMatchers("/swagger-resources/**").permitAll()
            // jhcc-custom : end
            .pathMatchers("/management/health").permitAll()
            .pathMatchers("/management/health/**").permitAll()
            .pathMatchers("/management/info").permitAll()
            .pathMatchers("/management/prometheus").permitAll()
            .pathMatchers("/management/**").hasAuthority(AuthoritiesConstants.ADMIN);
        // for xsrf-token
        http.csrf().csrfTokenRepository(CookieServerCsrfTokenRepository.withHttpOnlyFalse());

        http.oauth2Login()
            .and()
            .oauth2ResourceServer()
            .jwt()
            .jwtAuthenticationConverter(jwtAuthenticationConverter());
        http.oauth2Client();

        // @formatter:on
        return http.build();
    }

    /**
     * Replaces Spring Boot's issuer-location based {@link ReactiveClientRegistrationRepository}.
     * Spring Boot backs off via {@code @ConditionalOnMissingBean}, so defining this bean disables
     * the buggy auto-configured path.
     *
     * <p>Why this exists -- <a href="https://github.com/jhipster/jhipster-control-center/issues/174">issue #174</a>:
     * Spring Security 5.4 resolves the OIDC discovery document into a Jackson {@code Map} and then
     * calls {@code new JSONObject(map)}, which copies only the top level. Nested objects -- such as
     * the {@code mtls_endpoint_aliases} object Keycloak ≥15 emits -- stay plain {@code Map}s, and the
     * Nimbus SDK rejects them with {@code ParseException} at startup. Fetching the document as a
     * {@code String} and parsing it with the SDK's own parser handles nesting correctly.
     *
     * @return a repository holding the single {@code oidc} client registration.
     */
    @Bean
    public ReactiveClientRegistrationRepository clientRegistrationRepository() {
        ClientRegistration registration = OidcDiscoveryClientRegistrationFactory.buildClientRegistration(
            "oidc",
            clientId,
            clientSecret,
            scope,
            issuerUri,
            providerMetadata()
        );
        return new InMemoryReactiveClientRegistrationRepository(registration);
    }

    /**
     * Fetches the OIDC discovery document from the issuer as a {@code String} and parses it with
     * the Nimbus SDK's own parser, which handles nested JSON objects correctly. The result is
     * cached for the lifetime of the application context.
     *
     * @return the parsed provider metadata.
     */
    private OIDCProviderMetadata providerMetadata() {
        if (providerMetadata == null) {
            URI discoveryUri = UriComponentsBuilder
                .fromUriString(issuerUri)
                .path("/.well-known/openid-configuration")
                .build()
                .toUri();
            String discoveryDocument = WebClient.create().get().uri(discoveryUri).retrieve().bodyToMono(String.class).block();
            providerMetadata = OidcDiscoveryClientRegistrationFactory.parseDiscoveryDocument(discoveryDocument);
        }
        return providerMetadata;
    }

    Converter<Jwt, Mono<AbstractAuthenticationToken>> jwtAuthenticationConverter() {
        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(new JwtGrantedAuthorityConverter());
        return new ReactiveJwtAuthenticationConverterAdapter(jwtAuthenticationConverter);
    }

    /**
     * Map authorities from "groups" or "roles" claim in ID Token.
     *
     * @return a {@link ReactiveOAuth2UserService} that has the groups from the IdP.
     */
    @Bean
    public ReactiveOAuth2UserService<OidcUserRequest, OidcUser> oidcUserService() {
        final OidcReactiveOAuth2UserService delegate = new OidcReactiveOAuth2UserService();

        return userRequest -> {
            // Delegate to the default implementation for loading a user
            return delegate
                .loadUser(userRequest)
                .map(
                    user -> {
                        Set<GrantedAuthority> mappedAuthorities = new HashSet<>();
                        user
                            .getAuthorities()
                            .forEach(
                                authority -> {
                                    if (authority instanceof OidcUserAuthority) {
                                        OidcUserAuthority oidcUserAuthority = (OidcUserAuthority) authority;
                                        mappedAuthorities.addAll(
                                            SecurityUtils.extractAuthorityFromClaims(oidcUserAuthority.getUserInfo().getClaims())
                                        );
                                    }
                                }
                            );
                        return new DefaultOidcUser(mappedAuthorities, user.getIdToken(), user.getUserInfo());
                    }
                );
        };
    }

    @Bean
    ReactiveJwtDecoder jwtDecoder() {
        NimbusReactiveJwtDecoder jwtDecoder = (NimbusReactiveJwtDecoder) ReactiveJwtDecoders.fromOidcIssuerLocation(issuerUri);

        OAuth2TokenValidator<Jwt> audienceValidator = new AudienceValidator(jHipsterProperties.getSecurity().getOauth2().getAudience());
        OAuth2TokenValidator<Jwt> withIssuer = JwtValidators.createDefaultWithIssuer(issuerUri);
        OAuth2TokenValidator<Jwt> withAudience = new DelegatingOAuth2TokenValidator<>(withIssuer, audienceValidator);

        jwtDecoder.setJwtValidator(withAudience);

        return jwtDecoder;
    }
}
