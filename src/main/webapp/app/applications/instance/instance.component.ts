import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import InstanceModalVue from './instance-modal.vue';
import InstanceService, { Instance } from './instance.service';
import { Component, Inject, Vue } from 'vue-property-decorator';
import { RefreshService } from '@/shared/refresh/refresh.service';
import RefreshSelectorVue from '@/shared/refresh/refresh-selector.mixin.vue';

@Component({
  components: {
    'instance-modal': InstanceModalVue,
    'refresh-selector': RefreshSelectorVue,
  },
})
export default class JhiInstance extends Vue {
  public instances?: Array<Instance> = null;
  public instancesRoute: Array<any> = null;
  public isStaticProfile = false;
  private unsubscribe$ = new Subject();

  // instance modal attributes
  public instanceModal: any = null;
  public selectedInstance: Instance = null;
  public selectedInstanceRoute: string = null;

  // input for new static instance form
  public inputServiceName = '';
  public inputURL = '';

  @Inject('instanceService') private instanceService: () => InstanceService;
  @Inject('refreshService') private refreshService: () => RefreshService;

  public mounted(): void {
    this.refreshService()
      .refreshReload$.pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.refreshInstancesData();
        this.refreshInstancesRoute();
      });
    this.refreshInstancesData();
    this.refreshInstancesRoute();
    this.isStaticProfile = this.$store.getters.activeProfiles.includes('static');
  }

  public refreshInstancesData(): void {
    this.instanceService()
      .findAllInstance()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(instances => {
        this.instances = instances;
      });
  }

  public refreshInstancesRoute(): void {
    this.instanceService()
      .findAllGatewayRoute()
      .then(res => {
        this.instancesRoute = res.data;
      })
      .catch(error => {
        console.warn(error);
      });
  }

  public showInstance(instance: Instance, uri: string): void {
    this.selectedInstance = instance;
    for (let i = 0; i < this.instancesRoute.length; i++) {
      const isRouteOfThisService = this.instancesRoute[i].route_id.includes(this.selectedInstance.serviceId.toLowerCase());
      if (this.instancesRoute[i].uri === uri && isRouteOfThisService) {
        this.selectedInstanceRoute = this.instancesRoute[i].route_id;
        break;
      }
    }
    this.instanceModal = <any>this.$refs.instanceModal;
    this.instanceModal.show();
  }

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
      centered: true,
    };
    this.$bvModal
      .msgBoxConfirm('Are you sure you want to shutdown the instance ?', config)
      .then(isYes => {
        if (isYes) {
          this.shutdownInstance(instance);
        }
      })
      .catch(error => console.warn(error));
  }

  public shutdownInstance(instance: Instance): void {
    this.instanceService()
      .shutdownInstance(instance)
      .then(() => {
        this.successToast('Instance shutdown successful');
      })
      .catch(error => {
        this.errorToast(error);
      });
  }

  public onHiddenAddStaticInstance() {
    this.$bvModal.hide('newStaticInstanceModal');
    this.refreshService().refreshReload();
    this.inputServiceName = '';
    this.inputURL = '';
  }

  public onSubmitAddStaticInstance() {
    this.addStaticInstance(this.inputServiceName, this.inputURL);
  }

  public async addStaticInstance(serviceId: string, url: string) {
    const addStaticInstanceResponse = await this.instanceService().addStaticInstance(serviceId, url);
    if (addStaticInstanceResponse.status !== 201) {
      const errorMessage = `${addStaticInstanceResponse.status} - ${addStaticInstanceResponse.data}`;
      this.errorToast(errorMessage);
    } else {
      const successMessage = `${serviceId} instance added`;
      this.successToast(successMessage);
    }
  }

  public confirmRemoveStaticInstance(instance: Instance): void {
    const config = {
      title: 'Please Confirm',
      size: 'sm',
      buttonSize: 'sm',
      okVariant: 'danger',
      okTitle: 'YES',
      cancelTitle: 'NO',
      footerClass: 'p-2',
      hideHeaderClose: false,
      centered: true,
    };
    this.$bvModal
      .msgBoxConfirm(`Are you sure you want to remove the instance ${instance.serviceId} ?`, config)
      .then(isYes => {
        if (isYes) {
          this.removeStaticInstance(instance);
        }
      })
      .catch(error => console.warn(error));
  }

  public removeStaticInstance(instance: Instance): void {
    this.instanceService()
      .removeStaticInstance(instance.serviceId)
      .then(() => {
        this.successToast(`Instance ${instance.serviceId} removed`);
        this.refreshService().refreshReload();
      })
      .catch(error => {
        this.errorToast(error);
      });
  }

  public successToast(message: string) {
    return this.$bvToast.toast(message, {
      title: 'Success',
      variant: 'success',
      solid: true,
      autoHideDelay: 5000,
    });
  }

  public errorToast(message: string) {
    return this.$bvToast.toast(message, {
      title: `Error`,
      variant: 'danger',
      solid: true,
      autoHideDelay: 5000,
    });
  }

  /* istanbul ignore next */
  beforeDestroy(): any {
    // prevent memory leak when component destroyed
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
