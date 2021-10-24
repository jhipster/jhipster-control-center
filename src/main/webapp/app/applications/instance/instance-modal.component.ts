import InstanceService from './instance.service';
import type { Instance } from './instance.service';
import { Component, Inject, Prop, Vue } from 'vue-property-decorator';

@Component
export default class JhiInstanceModal extends Vue {
  public activeProfiles: any = {};
  @Prop() selectedInstance!: Instance;
  @Prop() selectedInstanceRoute!: any;
  @Inject('instanceService') private instanceService: () => InstanceService;

  public mounted(): void {
    this.refreshProfile();
  }

  /** Update profile of selected application instance */
  public refreshProfile(): void {
    if (this.selectedInstance.serviceId !== 'consul') {
      this.instanceService()
        .findActiveProfiles(this.selectedInstanceRoute)
        .then(res => {
          this.activeProfiles = res.data;
        })
        .catch(error => {
          console.warn(error);
        });
    } else {
      this.activeProfiles = {};
    }
  }
}
