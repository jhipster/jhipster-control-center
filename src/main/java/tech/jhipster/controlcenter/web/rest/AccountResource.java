package tech.jhipster.controlcenter.web.rest;

import com.fasterxml.jackson.annotation.JsonCreator;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class AccountResource {

    private static class AccountResourceException extends RuntimeException {
    }

    /**
     * {@code GET  /account} : get the current user.
     *
     * @return the current user.
     * @throws AccountResourceException {@code 500 (Internal Server Error)} if the user couldn't be returned.
     */
    @GetMapping("/account")
    public Mono<UserVM> getAccount() {
        return ReactiveSecurityContextHolder.getContext()
            .map(SecurityContext::getAuthentication)
            .map(authentication -> {
                String login;
                if (authentication.getPrincipal() instanceof UserDetails) {
                    login = ((UserDetails) authentication.getPrincipal()).getUsername();
                } else if (authentication.getPrincipal() instanceof String) {
                    login = (String) authentication.getPrincipal();
                } else {
                    throw new AccountResourceException();
                }
                Set<String> authorities = authentication.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.toSet());
                return new UserVM(login, authorities);
            })
            .switchIfEmpty(Mono.error(new AccountResourceException()));
    }

    private static class UserVM {
        private String login;
        private Set<String> authorities;

        @JsonCreator
        UserVM(String login, Set<String> authorities) {
            this.login = login;
            this.authorities = authorities;
        }

        public boolean isActivated() {
            return true;
        }

        public Set<String> getAuthorities() {
            return authorities;
        }

        public String getLogin() {
            return login;
        }
    }
}
