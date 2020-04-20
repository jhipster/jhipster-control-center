import InstanceService, { Instance } from './instance.service';
import { Component, Inject, Prop, Vue } from 'vue-property-decorator';

@Component
export default class JhiInstanceModal extends Vue {
  public activeProfiles: any = null;
  @Prop() selectedInstance!: Instance;
  @Prop() selectedInstanceRoute!: any;
  @Inject('instanceService') private instanceService: () => InstanceService;

  public mounted(): void {
    this.refreshProfile();
  }

  /** Update profile of current application instance */
  public refreshProfile(): void {
    /* istanbul ignore else */
    if (this.selectedInstance.serviceId !== 'consul') {
      this.instanceService()
        .findActiveProfiles(this.selectedInstanceRoute)
        .then(res => {
          this.activeProfiles = res.data;
        })
        .catch(error => {
          this.activeProfiles = error.error;
        });
    } else {
      this.activeProfiles = {};
    }
  }
}
