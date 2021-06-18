import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import InstanceModalVue from './instance-modal.vue';
import InstanceService, { Instance } from './instance.service';
import { Component, Inject, Vue } from 'vue-property-decorator';
import { RefreshService } from '@/shared/refresh/refresh.service';
import RefreshSelectorVue from '@/shared/refresh/refresh-selector.mixin.vue';
import InstanceHealthService from '@/applications/health/health.service';
import { Route } from '@/shared/routes/routes.service';

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
  public healthData: any = null;
  public activeRoute: Route;

  // instance modal attributes
  public instanceModal: any = null;
  public selectedInstance: Instance = null;
  public selectedInstanceRoute: string = null;

  // input for new static instance form
  public inputServiceName = '';
  public inputURL = '';

  public gitCommitPropName = 'git-commit';
  public gitBranchPropName = 'git-branch';
  public versionPropName = 'version';

  @Inject('instanceService') private instanceService: () => InstanceService;
  @Inject('refreshService') private refreshService: () => RefreshService;
  @Inject('instanceHealthService') private instanceHealthService: () => InstanceHealthService;
  public mounted(): void {
    this.refreshService()
      .refreshReload$.pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.refreshInstancesData();
      });
    this.refreshInstancesData();
    this.isStaticProfile = this.$store.getters.activeProfiles.includes('static');
  }

  public refreshInstancesData(): void {
    this.instanceService()
      .findAllInstance()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(instances => {
        this.instances = instances;
        this.refreshInstancesRoute();
      });
  }

  public refreshInstancesRoute(): void {
    this.instanceService()
      .findAllGatewayRoute()
      .then(res => {
        this.instancesRoute = res.data;
        this.instancesRoute.forEach(({ route_id }) => {
          this.refreshInstancesProfil(route_id);
          this.refreshInstancesHealth(route_id);
        });
      })
      .catch(error => {
        console.warn(error);
      });
  }

  public refreshInstancesProfil(instanceRouteId: string): void {
    this.instanceService()
      .findActiveProfiles(instanceRouteId)
      .then(result => {
        this.updateMetadata(instanceRouteId, 'profile', result.data.activeProfiles);
      });
  }

  public refreshInstancesHealth(instanceRouteId): void {
    const instanceRoute = {
      path: instanceRouteId,
      predicate: '',
      filters: [],
      serviceId: '',
      instanceId: '',
      instanceUri: '',
      order: 0,
    };

    this.instanceHealthService()
      .checkHealth(instanceRoute)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(health => {
        this.updateMetadata(instanceRouteId, 'status', health.status);
      });
  }

  private updateMetadata(instanceRouteId, fieldName, value) {
    const index = this.instances.findIndex(instance => {
      return instanceRouteId.includes(instance.serviceId.toLowerCase());
    });
    this.instances[index].metadata[fieldName] = value;
    this.$set(this.instances, index, this.instances[index]);
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

  public getBadgeClass(statusState: any): string {
    if (statusState === 'UP') {
      return 'badge-success';
    }
    return 'badge-danger';
  }

  public versionInstance(instance: Instance): string {
    const result = [];

    if (this.hasMetadataPropertyNotNull(instance, this.versionPropName)) {
      result.push(instance.metadata[this.versionPropName]);
    }
    if (this.hasMetadataPropertyNotNull(instance, this.gitCommitPropName)) {
      result.push(instance.metadata[this.gitCommitPropName]);
    }
    if (this.hasMetadataPropertyNotNull(instance, this.gitBranchPropName)) {
      result.push(instance.metadata[this.gitBranchPropName]);
    }
    if (result.length === 0) {
      return 'N/A';
    }

    return result.join(' ');
  }

  public hasMetadataPropertyNotNull(instance: Instance, property: string): boolean {
    if (!instance || !instance.metadata) {
      return false;
    }

    return Object.prototype.hasOwnProperty.call(instance.metadata, property) && !!instance.metadata[property];
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
