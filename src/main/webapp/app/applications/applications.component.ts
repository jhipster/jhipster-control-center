import ApplicationsService, { Application, Instance } from './applications.service';
import { Component, Inject, Vue } from 'vue-property-decorator';
import JhiApplicationsModal from './applications-modal.vue';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  components: {
    'applications-modal': JhiApplicationsModal
  }
})
export default class JhiApplications extends Vue {
  public applications?: Array<Application> = null;
  public applicationsRoute: Array<any> = null;
  public currentApplication: Application = null;
  public currentRoute: any = null;
  public applicationModal: any = null;
  private unsubscribe$ = new Subject();
  @Inject('applicationsService') private applicationsService: () => ApplicationsService;

  public mounted(): void {
    this.refreshApplicationsData();
    this.refreshApplicationsRoute();
  }

  /** Update applicationsData which contains list of applications */
  public refreshApplicationsData(): void {
    this.applicationsService()
      .findAll()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(applications => {
        this.applications = applications;
      });
  }

  /** Update applicationsRoute which contains list of routes */
  public refreshApplicationsRoute(): void {
    this.applicationsService()
      .findAllGatewayRoute()
      .then(res => {
        this.applicationsRoute = res.data;
      })
      .catch(error => {
        this.applicationsRoute = error.error;
      });
  }

  /** Display details about an application in a b-modal */
  public showApplication(application: any, uri: string): void {
    this.currentApplication = application;
    for (let i = 0; i < this.applicationsRoute.length; i++) {
      if (this.applicationsRoute[i].uri === uri) {
        this.currentRoute = this.applicationsRoute[i].route_id;
        break;
      }
    }
    this.applicationModal = <any>this.$refs.applicationModal;
    this.applicationModal.show();
  }

  /* istanbul ignore next */
  beforeDestroy(): any {
    // prevent memory leak when component destroyed
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
