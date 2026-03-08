package tech.jhipster.controlcenter.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.InMemoryReactiveClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.ReactiveClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.server.ServerOAuth2AuthorizedClientRepository;
import org.springframework.security.oauth2.client.web.server.WebSessionServerOAuth2AuthorizedClientRepository;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.util.StringUtils;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfiguration {

    private final ApplicationProperties applicationProperties;

    public SecurityConfiguration(ApplicationProperties applicationProperties) {
        this.applicationProperties = applicationProperties;
    }

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        http
            .authorizeExchange(exchanges -> exchanges
                .pathMatchers("/", "/*", "/favicon.ico", "/**/*.png", "/**/*.gif", "/**/*.svg", "/**/*.jpg", "/**/*.html", "/**/*.css", "/**/*.js").permitAll()
                .pathMatchers("/app/**").authenticated()
                .pathMatchers("/management/**").permitAll()
                .pathMatchers("/api/**").authenticated()
                .pathMatchers("/v3/api-docs/**").permitAll()
                .anyExchange().authenticated()
            )
            .oauth2Login(oauth2 -> {})
            .oauth2Client(oauth2 -> {})
            .csrf(csrf -> csrf.disable());
        return http.build();
    }

    @Bean
    public ReactiveClientRegistrationRepository clientRegistrationRepository() {
        return new InMemoryReactiveClientRegistrationRepository(this.clientRegistration());
    }

    private ClientRegistration clientRegistration() {
        ApplicationProperties.OAuth2 oAuth2 = applicationProperties.getOauth2();
        String issuerUri = oAuth2.getIssuerUri();
        
        return ClientRegistration
            .withRegistrationId("oidc")
            .clientId(oAuth2.getClientId())
            .clientSecret(oAuth2.getClientSecret())
            .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
            .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
            .redirectUri("{baseUrl}/login/oauth2/code/{registrationId}")
            .scope("openid", "profile", "email")
            .authorizationUri(issuerUri + "/protocol/openid-connect/auth")
            .tokenUri(issuerUri + "/protocol/openid-connect/token")
            .jwkSetUri(issuerUri + "/protocol/openid-connect/certs")
            .userInfoUri(issuerUri + "/protocol/openid-connect/userinfo")
            .userNameAttributeName("sub")
            .clientName("oidc")
            .build();
    }

    @Bean
    public ServerOAuth2AuthorizedClientRepository authorizedClientRepository() {
        return new WebSessionServerOAuth2AuthorizedClientRepository();
    }
}