import { Component, Inject, Vue } from 'vue-property-decorator';
import AccountService from '@/account/account.service';

@Component
export default class VueSidebarMenu extends Vue {
  @Inject('accountService')
  private accountService: () => AccountService;

  private hasAnyAuthorityValue = false;

  created() {}

  public hasAnyAuthority(authorities: any): boolean {
    this.accountService()
      .hasAnyAuthorityAndCheckAuth(authorities)
      .then(value => {
        this.hasAnyAuthorityValue = value;
      });
    return this.hasAnyAuthorityValue;
  }

  public get openAPIEnabled(): boolean {
    return this.$store.getters.activeProfiles.indexOf('api-docs') > -1;
  }
}
