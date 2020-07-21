import { Component, Inject, Vue } from 'vue-property-decorator';
import { VERSION } from '@/constants';
import LoginService from '@/account/login.service';
import AccountService from '@/account/account.service';
import { profile } from 'console';

@Component
export default class JhiNavbar extends Vue {
  @Inject('loginService')
  private loginService: () => LoginService;

  @Inject('accountService') private accountService: () => AccountService;
  public version = VERSION ? 'v' + VERSION : '';
  private currentLanguage = this.$store.getters.currentLanguage;
  private languages: any = this.$store.getters.languages;
  private hasAnyAuthorityValue = false;

  created() {}

  public subIsActive(input) {
    const paths = Array.isArray(input) ? input : [input];
    return paths.some(path => {
      return this.$route.path.indexOf(path) === 0; // current path starts with this path string
    });
  }

  // jhcc-custom
  /* istanbul ignore next */
  public logout(): void {
    this.loginService()
      .getProfileInfo()
      .then(profileInfo => {
        const profiles: string[] = profileInfo.data['activeProfiles'];
        if (profiles.includes('oauth2')) {
          this.loginService()
            .logout()
            .then(response => {
              this.$store.commit('logout');
              this.$router.push('/');
              const data = response.data;
              let logoutUrl = data.logoutUrl;
              // if Keycloak, uri has protocol/openid-connect/token
              if (logoutUrl.indexOf('/protocol') > -1) {
                logoutUrl = logoutUrl + '?redirect_uri=' + window.location.origin;
              } else {
                // Okta
                logoutUrl = logoutUrl + '?id_token_hint=' + data.idToken + '&post_logout_redirect_uri=' + window.location.origin;
              }
              window.location.href = logoutUrl;
            });
        } else {
          localStorage.removeItem('jhi-authenticationToken');
          sessionStorage.removeItem('jhi-authenticationToken');
          this.$store.commit('logout');
          this.$router.push('/');
        }
      });
  }

  public openLogin(): void {
    this.loginService()
      .getProfileInfo()
      .then(response => {
        const profiles: string[] = response.data['activeProfiles'];
        if (profiles.includes('oauth2')) {
          this.loginService().login();
        } else {
          this.loginService().openLogin((<any>this).$root);
        }
      });
  }

  public get authenticated(): boolean {
    return this.$store.getters.authenticated;
  }

  public hasAnyAuthority(authorities: any): boolean {
    this.accountService()
      .hasAnyAuthorityAndCheckAuth(authorities)
      .then(value => {
        this.hasAnyAuthorityValue = value;
      });
    return this.hasAnyAuthorityValue;
  }

  public get swaggerEnabled(): boolean {
    return this.$store.getters.activeProfiles.indexOf('swagger') > -1;
  }

  public get inProduction(): boolean {
    return this.$store.getters.activeProfiles.indexOf('prod') > -1;
  }
}
