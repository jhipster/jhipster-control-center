import ApplicationsService from './applications.service';
import { Component, Inject, Prop, Vue } from 'vue-property-decorator';

@Component
export default class JhiApplicationsModal extends Vue {
  @Prop() currentApplication!: any;
  @Inject('applicationsService') private applicationsService: () => ApplicationsService;
}
