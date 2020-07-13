package tech.jhipster.controlcenter.config;

import static org.springframework.security.web.server.util.matcher.ServerWebExchangeMatchers.pathMatchers;

import io.github.jhipster.config.JHipsterProperties;
import io.github.jhipster.web.filter.reactive.CookieCsrfFilter;
import java.util.HashSet;
import java.util.Set;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.security.SecurityProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Profile;
import org.springframework.core.convert.converter.Converter;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.authentication.UserDetailsRepositoryReactiveAuthenticationManager;
import org.springframework.security.config.annotation.method.configuration.EnableReactiveMethodSecurity;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.SecurityWebFiltersOrder;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.MapReactiveUserDetailsService;
import org.springframework.security.core.userdetails.ReactiveUserDetailsService;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcReactiveOAuth2UserService;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.web.server.logout.OidcClientInitiatedServerLogoutSuccessHandler;
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
import org.springframework.security.web.server.header.XFrameOptionsServerHttpHeadersWriter;
import org.springframework.security.web.server.util.matcher.NegatedServerWebExchangeMatcher;
import org.springframework.security.web.server.util.matcher.OrServerWebExchangeMatcher;
import org.springframework.util.StringUtils;
import org.zalando.problem.spring.webflux.advice.security.SecurityProblemSupport;
import reactor.core.publisher.Mono;
import tech.jhipster.controlcenter.security.AuthoritiesConstants;
import tech.jhipster.controlcenter.security.SecurityUtils;
import tech.jhipster.controlcenter.security.jwt.JWTFilter;
import tech.jhipster.controlcenter.security.jwt.TokenProvider;
import tech.jhipster.controlcenter.security.oauth2.AudienceValidator;
import tech.jhipster.controlcenter.security.oauth2.JwtGrantedAuthorityConverter;
import tech.jhipster.controlcenter.web.filter.SpaWebFilter;

@EnableWebFluxSecurity
@EnableReactiveMethodSecurity
@Import(SecurityProblemSupport.class)
@Profile(Constants.PROFILE_OAUTH2)
public class Oauth2SecurityConfiguration {
    @Value("${spring.security.oauth2.client.provider.oidc.issuer-uri}")
    private String issuerUri;

    private final TokenProvider tokenProvider;

    private final JHipsterProperties jHipsterProperties;

    private final SecurityProblemSupport problemSupport;

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
    public MapReactiveUserDetailsService userDetailsService(SecurityProperties properties) {
        SecurityProperties.User user = properties.getUser();
        UserDetails userDetails = User
            .withUsername(user.getName())
            .password("{noop}" + user.getPassword())
            .roles(StringUtils.toStringArray(user.getRoles()))
            .build();
        return new MapReactiveUserDetailsService(userDetails);
    }

    @Bean
    public ReactiveAuthenticationManager reactiveAuthenticationManager(ReactiveUserDetailsService userDetailsService) {
        return new UserDetailsRepositoryReactiveAuthenticationManager(userDetailsService);
    }

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(
        ServerHttpSecurity http,
        ReactiveClientRegistrationRepository clientRegistrationRepository
    ) {
        // Authenticate through configured OpenID Provider
        http.oauth2Login();

        http.oauth2ResourceServer().jwt().jwtAuthenticationConverter(jwtAuthenticationConverter());
        http.oauth2Client();

        // Also logout at the OpenID Connect provider
        http.logout(logout -> logout.logoutSuccessHandler(new OidcClientInitiatedServerLogoutSuccessHandler(clientRegistrationRepository)));

        http
            .securityMatcher(
                new NegatedServerWebExchangeMatcher(
                    new OrServerWebExchangeMatcher(
                        pathMatchers("/app/**", "/i18n/**", "/content/**", "/swagger-ui/**", "/test/**", "/webjars/**"),
                        pathMatchers(HttpMethod.OPTIONS, "/**")
                    )
                )
            )
            .addFilterAt(new JWTFilter(tokenProvider), SecurityWebFiltersOrder.HTTP_BASIC)
            .exceptionHandling()
            .accessDeniedHandler(problemSupport)
            .authenticationEntryPoint(problemSupport)
            .and()
            .headers()
            .contentSecurityPolicy(
                "default-src 'self'; frame-src 'self' data:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://storage.googleapis.com; style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; img-src 'self' data:; font-src 'self' https://fonts.gstatic.com data:"
            )
            .and()
            .referrerPolicy(ReferrerPolicyServerHttpHeadersWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN)
            .and()
            .featurePolicy(
                "geolocation 'none'; midi 'none'; sync-xhr 'none'; microphone 'none'; camera 'none'; magnetometer 'none'; gyroscope 'none'; speaker 'none'; fullscreen 'self'; payment 'none'"
            );

        // Require authentication for all requests
        http
            .authorizeExchange()
            .pathMatchers("/")
            .permitAll()
            .pathMatchers("/*.*")
            .permitAll()
            .pathMatchers("/api/auth-info")
            .permitAll()
            .pathMatchers("/api/authenticate")
            .permitAll()
            .pathMatchers("/api/**")
            .authenticated()
            // jhcc-custom : begin
            .pathMatchers("/services/**", "/gateway/**", "/v2/api-docs", "/swagger-ui/index.html")
            .authenticated()
            .pathMatchers("/swagger-resources/**")
            .permitAll()
            .pathMatchers("/management/health")
            .permitAll()
            .pathMatchers("/management/info")
            .permitAll()
            .pathMatchers("/management/prometheus")
            .permitAll()
            .pathMatchers("/management/**")
            .hasAuthority(AuthoritiesConstants.ADMIN);
        // jhcc-custom : end

        // Allow showing /home within a frame
        http.headers().frameOptions().mode(XFrameOptionsServerHttpHeadersWriter.Mode.SAMEORIGIN);

        // Disable CSRF in the gateway to prevent conflicts with proxied service CSRF
        http.csrf().disable();
        return http.build();
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
