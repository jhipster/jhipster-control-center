package tech.jhipster.controlcenter.config;

import com.nimbusds.oauth2.sdk.ParseException;
import com.nimbusds.openid.connect.sdk.op.OIDCProviderMetadata;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.core.oidc.IdTokenClaimNames;
import org.springframework.util.Assert;

/**
 * Builds a {@link ClientRegistration} from an OIDC discovery document that was fetched as a
 * {@code String} and parsed with the Nimbus SDK's own parser.
 *
 * <p>This exists to work around
 * <a href="https://github.com/jhipster/jhipster-control-center/issues/174">jhipster-control-center#174</a>:
 * Spring Security 5.4 resolves the discovery document into a Jackson {@code Map} and then calls
 * {@code new JSONObject(map)}, which copies only the top level. Nested objects -- such as the
 * {@code mtls_endpoint_aliases} object Keycloak ≥15 emits -- stay plain {@code Map}s, and the
 * Nimbus SDK rejects them with {@code ParseException} at startup. Parsing the raw document
 * String with {@link OIDCProviderMetadata#parse(String)} handles nesting correctly on every SDK
 * version tried.
 *
 * <p>The produced registration mirrors what Spring Boot's issuer-location auto-configuration
 * would build (registration id {@code "oidc"}, {@code BASIC} client authentication,
 * {@code authorization_code} grant, {@code {baseUrl}/{action}/oauth2/code/{registrationId}}
 * redirect template, {@code sub} as the user-name attribute).
 */
final class OidcDiscoveryClientRegistrationFactory {

    private OidcDiscoveryClientRegistrationFactory() {
        // utility class
    }

    /**
     * Parses an OIDC discovery document with the Nimbus SDK's own parser.
     *
     * @param discoveryDocument the raw discovery document, exactly as served by the IdP.
     * @return the parsed provider metadata.
     * @throws IllegalArgumentException if the document cannot be parsed.
     */
    static OIDCProviderMetadata parseDiscoveryDocument(String discoveryDocument) {
        Assert.hasText(discoveryDocument, "discoveryDocument cannot be empty");
        try {
            return OIDCProviderMetadata.parse(discoveryDocument);
        } catch (ParseException ex) {
            throw new IllegalArgumentException("Unable to parse the OpenID Provider configuration", ex);
        }
    }

    /**
     * Builds the {@code oidc} {@link ClientRegistration} from parsed provider metadata.
     *
     * @param registrationId the registration id to use (Spring Boot uses {@code "oidc"}).
     * @param clientId the OAuth2 client id.
     * @param clientSecret the OAuth2 client secret.
     * @param scope the requested scopes.
     * @param issuerUri the expected issuer uri; must match the issuer in the discovery document.
     * @param metadata the parsed provider metadata.
     * @return a complete {@link ClientRegistration}.
     */
    static ClientRegistration buildClientRegistration(
        String registrationId,
        String clientId,
        String clientSecret,
        String[] scope,
        String issuerUri,
        OIDCProviderMetadata metadata
    ) {
        Assert.hasText(registrationId, "registrationId cannot be empty");
        Assert.hasText(clientId, "clientId cannot be empty");
        Assert.hasText(issuerUri, "issuerUri cannot be empty");
        Assert.notNull(metadata, "metadata cannot be null");
        Assert.state(
            issuerUri.equals(metadata.getIssuer().getValue()),
            () ->
                "The Issuer \"" +
                metadata.getIssuer().getValue() +
                "\" provided in the configuration metadata did not match the requested issuer \"" +
                issuerUri +
                "\""
        );
        Assert.notNull(metadata.getAuthorizationEndpointURI(), "The discovery document does not contain an authorization_endpoint");
        Assert.notNull(metadata.getTokenEndpointURI(), "The discovery document does not contain a token_endpoint");
        Assert.notNull(metadata.getUserInfoEndpointURI(), "The discovery document does not contain a userinfo_endpoint");
        Assert.notNull(metadata.getJWKSetURI(), "The discovery document does not contain a jwks_uri");

        return ClientRegistration
            .withRegistrationId(registrationId)
            .clientId(clientId)
            .clientSecret(clientSecret)
            .clientAuthenticationMethod(ClientAuthenticationMethod.BASIC)
            .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
            .redirectUri("{baseUrl}/{action}/oauth2/code/{registrationId}")
            .scope(scope)
            .authorizationUri(metadata.getAuthorizationEndpointURI().toASCIIString())
            .tokenUri(metadata.getTokenEndpointURI().toASCIIString())
            .userInfoUri(metadata.getUserInfoEndpointURI().toASCIIString())
            .jwkSetUri(metadata.getJWKSetURI().toASCIIString())
            .userNameAttributeName(IdTokenClaimNames.SUB)
            .issuerUri(issuerUri)
            .providerConfigurationMetadata(metadata.toJSONObject())
            .clientName(registrationId)
            .build();
    }
}
