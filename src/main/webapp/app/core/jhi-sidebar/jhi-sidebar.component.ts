import { Component, Inject, Vue } from 'vue-property-decorator';
import AccountService from '@/account/account.service';

@Component
export default class VueSidebarMenu extends Vue {
  @Inject('accountService')
  private accountService: () => AccountService;

  created() {}

  public hasAnyAuthority(authorities: any): Promise<boolean> {
    return this.accountService().hasAnyAuthorityAndCheckAuth(authorities);
  }

  public get swaggerEnabled(): boolean {
    return this.$store.getters.activeProfiles.indexOf('swagger') > -1;
  }
}
