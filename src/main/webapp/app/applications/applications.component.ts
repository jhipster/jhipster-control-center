import ApplicationsService from './applications.service';
import { Component, Inject, Vue } from 'vue-property-decorator';
import JhiApplicationsModal from './applications-modal.vue';

@Component({
  components: {
    'applications-modal': JhiApplicationsModal
  }
})
export default class JhiApplications extends Vue {
  public applicationsData: any = null;
  public currentApplication: any = null;
  @Inject('applicationsService') private applicationsService: () => ApplicationsService;

  public mounted(): void {
    this.getListApplications();
  }

  public getListApplications(): void {
    this.applicationsService()
      .findAll()
      .then(res => {
        this.applicationsData = res.data;
      })
      .catch(error => {
        this.applicationsData = error.error;
      });
  }

  public showApplication(application: any): void {
    this.currentApplication = application[0];
    (<any>this.$refs.applicationModal).show();
  }
}
