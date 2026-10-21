package tech.jhipster.controlcenter.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nimbusds.oauth2.sdk.ParseException;
import com.nimbusds.openid.connect.sdk.op.OIDCProviderMetadata;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import net.minidev.json.JSONObject;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;

/**
 * Regression tests for
 * <a href="https://github.com/jhipster/jhipster-control-center/issues/174">jhipster-control-center#174</a>.
 *
 * <p>The application fails to start against Keycloak ≥15 because Spring Security 5.4 resolves the
 * OIDC discovery document into a Jackson {@code Map} and then calls {@code new JSONObject(map)},
 * which copies only the top level. The nested {@code mtls_endpoint_aliases} object stays a plain
 * {@code Map} and the Nimbus SDK rejects it with {@code ParseException}. The fix fetches the
 * discovery document as a {@code String} and parses it with the SDK's own parser, which handles
 * nesting correctly.
 *
 * <p>Both tests run against a static Keycloak-style discovery document, so no IdP or Docker is
 * needed.
 */
class OidcDiscoveryDocumentParsingTest {

    private static final String ISSUER = "http://localhost:9080/auth/realms/jhipster";

    private final ObjectMapper objectMapper = new ObjectMapper();

    private String discoveryDocument() throws Exception {
        try (InputStream in = getClass().getResourceAsStream("/config/keycloak-discovery-document.json")) {
            assertThat(in).as("discovery document test resource").isNotNull();
            return new String(in.readAllBytes(), StandardCharsets.UTF_8);
        }
    }

    @Test
    void oldDiscoveryPathThrowsParseExceptionOnNestedMtlsEndpointAliases() throws Exception {
        // Reproduces the startup crash reported in #174: the old path reads the discovery document
        // into a Jackson Map and wraps it with new JSONObject(map). The nested mtls_endpoint_aliases
        // value is not converted, so the Nimbus SDK rejects it.
        Map<String, Object> asMap = objectMapper.readValue(discoveryDocument(), new TypeReference<Map<String, Object>>() {});

        assertThatThrownBy(() -> OIDCProviderMetadata.parse(new JSONObject(asMap))).isInstanceOf(ParseException.class);
    }

    @Test
    void newDiscoveryPathBuildsCompleteClientRegistration() throws Exception {
        // The fixed path: parse the discovery document as a String with the SDK's own parser, then
        // build the ClientRegistration exactly the way the production configuration does.
        OIDCProviderMetadata metadata = OidcDiscoveryClientRegistrationFactory.parseDiscoveryDocument(discoveryDocument());

        ClientRegistration registration = OidcDiscoveryClientRegistrationFactory.buildClientRegistration(
            "oidc",
            "web_app",
            "web_app",
            new String[] { "openid", "profile", "email" },
            ISSUER,
            metadata
        );

        assertThat(registration.getRegistrationId()).isEqualTo("oidc");
        assertThat(registration.getClientId()).isEqualTo("web_app");
        assertThat(registration.getClientAuthenticationMethod()).isEqualTo(ClientAuthenticationMethod.BASIC);
        assertThat(registration.getAuthorizationGrantType()).isEqualTo(AuthorizationGrantType.AUTHORIZATION_CODE);
        assertThat(registration.getScopes()).containsExactlyInAnyOrder("openid", "profile", "email");
        assertThat(registration.getRedirectUri()).isEqualTo("{baseUrl}/{action}/oauth2/code/{registrationId}");
        assertThat(registration.getProviderDetails().getIssuerUri()).isEqualTo(ISSUER);
        assertThat(registration.getProviderDetails().getAuthorizationUri())
            .isEqualTo(ISSUER + "/protocol/openid-connect/auth");
        assertThat(registration.getProviderDetails().getTokenUri()).isEqualTo(ISSUER + "/protocol/openid-connect/token");
        assertThat(registration.getProviderDetails().getUserInfoEndpoint().getUri())
            .isEqualTo(ISSUER + "/protocol/openid-connect/userinfo");
        assertThat(registration.getProviderDetails().getUserInfoEndpoint().getUserNameAttributeName()).isEqualTo("sub");
        assertThat(registration.getProviderDetails().getJwkSetUri()).isEqualTo(ISSUER + "/protocol/openid-connect/certs");
        assertThat(registration.getProviderDetails().getConfigurationMetadata()).containsKey("mtls_endpoint_aliases");
    }
}
