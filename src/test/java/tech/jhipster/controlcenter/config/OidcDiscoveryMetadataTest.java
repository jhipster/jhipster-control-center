package tech.jhipster.controlcenter.config;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nimbusds.openid.connect.sdk.op.OIDCProviderMetadata;
import com.sun.net.httpserver.HttpServer;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import net.minidev.json.JSONObject;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrations;
import org.springframework.security.oauth2.client.registration.InMemoryReactiveClientRegistrationRepository;

/**
 * Regression test for the startup failure reported in
 * <a href="https://github.com/jhipster/jhipster-control-center/issues/174">#174</a>.
 *
 * <p>Keycloak 15+ publishes {@code mtls_endpoint_aliases} in its OpenID Connect discovery
 * document. Spring Security reads that document into a {@code java.util.Map} and wraps it in a
 * shallow {@link JSONObject}, so the nested alias members are still plain {@code LinkedHashMap}s
 * when the Nimbus SDK parses them. Older {@code oauth2-oidc-sdk} versions reject that shape with
 * {@code Unexpected type of JSON object member with key mtls_endpoint_aliases}, which aborts the
 * creation of the reactive client registration repository while the application starts up.
 */
class OidcDiscoveryMetadataTest {

    private static final String MTLS_BASE_URL = "https://mtls.keycloak:9443/auth/realms/jhipster";

    @Test
    void shouldResolveClientRegistrationForIssuerPublishingMtlsEndpointAliases() throws Exception {
        HttpServer discoveryEndpoint = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        String issuer = "http://localhost:" + discoveryEndpoint.getAddress().getPort() + "/auth/realms/jhipster";
        byte[] discoveryDocument = new ObjectMapper().writeValueAsBytes(discoveryDocument(issuer));
        discoveryEndpoint.createContext(
            "/auth/realms/jhipster/.well-known/openid-configuration",
            exchange -> {
                exchange.getResponseHeaders().add("Content-Type", "application/json");
                exchange.sendResponseHeaders(200, discoveryDocument.length);
                try (OutputStream responseBody = exchange.getResponseBody()) {
                    responseBody.write(discoveryDocument);
                }
            }
        );
        discoveryEndpoint.start();

        try {
            ClientRegistration clientRegistration = ClientRegistrations
                .fromIssuerLocation(issuer)
                .clientId("jhipster-control-center")
                .clientSecret("jhipster-control-center")
                .redirectUri("{baseUrl}/{action}/oauth2/code/{registrationId}")
                .build();

            assertThat(clientRegistration.getProviderDetails().getIssuerUri()).isEqualTo(issuer);

            // same repository that Spring Boot creates for this reactive application
            InMemoryReactiveClientRegistrationRepository clientRegistrationRepository = new InMemoryReactiveClientRegistrationRepository(
                clientRegistration
            );
            assertThat(clientRegistrationRepository.findByRegistrationId(clientRegistration.getRegistrationId()).block()).isNotNull();
        } finally {
            discoveryEndpoint.stop(0);
        }
    }

    @Test
    void shouldKeepMtlsEndpointAliasesWhenDiscoveryDocumentIsParsedFromAShallowJsonObject() throws Exception {
        JSONObject discoveryDocument = new JSONObject(discoveryDocument("http://keycloak:9080/auth/realms/jhipster"));

        OIDCProviderMetadata providerMetadata = OIDCProviderMetadata.parse(discoveryDocument);

        assertThat(providerMetadata.getMtlsEndpointAliases()).isNotNull();
        assertThat(providerMetadata.getMtlsEndpointAliases().getTokenEndpointURI().toString()).startsWith(MTLS_BASE_URL);
    }

    private static Map<String, Object> discoveryDocument(String issuer) {
        Map<String, Object> mtlsEndpointAliases = new HashMap<>();
        mtlsEndpointAliases.put("token_endpoint", MTLS_BASE_URL + "/protocol/openid-connect/token");
        mtlsEndpointAliases.put("revocation_endpoint", MTLS_BASE_URL + "/protocol/openid-connect/revoke");
        mtlsEndpointAliases.put("introspection_endpoint", MTLS_BASE_URL + "/protocol/openid-connect/token/introspect");

        Map<String, Object> metadata = new HashMap<>();
        metadata.put("issuer", issuer);
        metadata.put("authorization_endpoint", issuer + "/protocol/openid-connect/auth");
        metadata.put("token_endpoint", issuer + "/protocol/openid-connect/token");
        metadata.put("token_introspection_endpoint", issuer + "/protocol/openid-connect/token/introspect");
        metadata.put("end_session_endpoint", issuer + "/protocol/openid-connect/logout");
        metadata.put("jwks_uri", issuer + "/protocol/openid-connect/certs");
        metadata.put("userinfo_endpoint", issuer + "/protocol/openid-connect/userinfo");
        metadata.put("grant_types_supported", List.of("authorization_code", "refresh_token", "password", "client_credentials"));
        metadata.put("response_types_supported", List.of("code", "none", "id_token", "token", "id_token token", "code id_token"));
        metadata.put("subject_types_supported", List.of("public"));
        metadata.put("id_token_signing_alg_values_supported", List.of("PS256", "RS256", "ES256"));
        metadata.put("token_endpoint_auth_methods_supported", List.of("private_key_jwt", "client_secret_basic", "client_secret_post"));
        metadata.put("mtls_endpoint_aliases", mtlsEndpointAliases);
        return metadata;
    }
}
