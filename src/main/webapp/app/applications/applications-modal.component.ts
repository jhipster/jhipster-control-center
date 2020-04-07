import ApplicationsService from './applications.service';
import { Component, Inject, Prop, Vue } from 'vue-property-decorator';

@Component
export default class JhiApplicationsModal extends Vue {
  public activeProfiles: any = null;
  @Prop() currentApplication!: any;
  @Prop() currentRoute!: any;
  @Inject('applicationsService') private applicationsService: () => ApplicationsService;

  public mounted(): void {
    /** TODO fix method findActiveProfiles() */
    // this.refreshProfile();
  }

  /** Update profile of current application */
  public refreshProfile(): void {
    this.applicationsService()
      .findActiveProfiles(this.currentRoute)
      .then(res => {
        // console.log for dev
        console.log(res.data);
        this.activeProfiles = res.data;
      })
      .catch(error => {
        // console.log for dev
        console.log(error);
        this.activeProfiles = error.error;
      });
  }
}
