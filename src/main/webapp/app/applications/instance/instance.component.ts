import { Component, Inject, Mixins, Vue } from 'vue-property-decorator';
import InstanceService, { Instance } from './instance.service';
import InstanceModalVue from './instance-modal.vue';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import RefreshSelectorVue from '@/shared/refresh/refresh-selector.mixin.vue';
import { RefreshService } from '@/shared/refresh/refresh.service';

@Component({
  components: {
    'instance-modal': InstanceModalVue,
    'refresh-selector': RefreshSelectorVue
  }
})
export default class JhiInstance extends Vue {
  public instances?: Array<Instance> = null;
  public instancesRoute: Array<any> = null;
  public selectedInstance: Instance = null;
  public selectedInstanceRoute: string = null;
  public instanceModal: any = null;
  private unsubscribe$ = new Subject();
  @Inject('instanceService') private instanceService: () => InstanceService;
  @Inject('refreshService') private refreshService: () => RefreshService;

  public mounted(): void {
    this.refreshService()
      .refreshReload$.pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => this.refreshInstancesData());
    this.refreshInstancesData();
    this.refreshInstancesRoute();
  }

  /** Update instancesData which contains list of applications instances */
  public refreshInstancesData(): void {
    this.instanceService()
      .findAll()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(instances => {
        this.instances = instances;
      });
  }

  /** Update instancesRoute which contains list of routes */
  public refreshInstancesRoute(): void {
    this.instanceService()
      .findAllGatewayRoute()
      .then(res => {
        this.instancesRoute = res.data;
      })
      .catch(error => {
        this.instancesRoute = error.error;
      });
  }

  /** Display details about an instance in a b-modal */
  public showInstance(instance: Instance, uri: string): void {
    this.selectedInstance = instance;
    for (let i = 0; i < this.instancesRoute.length; i++) {
      if (this.instancesRoute[i].uri === uri) {
        this.selectedInstanceRoute = this.instancesRoute[i].route_id;
        break;
      }
    }
    this.instanceModal = <any>this.$refs.instanceModal;
    this.instanceModal.show();
  }

  /* Modal dialog */
  public confirmShutdown(instance: Instance): void {
    const config = {
      title: 'Please Confirm',
      size: 'sm',
      buttonSize: 'sm',
      okVariant: 'danger',
      okTitle: 'YES',
      cancelTitle: 'NO',
      footerClass: 'p-2',
      hideHeaderClose: false,
      centered: true
    };
    this.$bvModal
      .msgBoxConfirm('Are you sure you want to shutdown the instance ?', config)
      .then(res => {
        if (res) {
          this.shutdownInstance(instance);
        }
      })
      .catch(err => console.warn(err));
  }

  /* shutdown an instance */
  public shutdownInstance(instance: Instance): void {
    this.instanceService()
      .shutdownInstance(instance)
      .then(() => {
        return this.$bvToast.toast('Instance shutdown successful', {
          title: 'Success',
          variant: 'success',
          solid: true,
          autoHideDelay: 5000
        });
      })
      .catch(err => {
        return this.$bvToast.toast(`${err}`, {
          title: `Error`,
          variant: 'danger',
          solid: true,
          autoHideDelay: 5000
        });
      });
  }

  /* istanbul ignore next */
  beforeDestroy(): any {
    // prevent memory leak when component destroyed
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
