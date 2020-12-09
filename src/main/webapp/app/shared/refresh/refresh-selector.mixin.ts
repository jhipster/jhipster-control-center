import { Component, Inject, Vue } from 'vue-property-decorator';
import { RefreshService } from '@/shared/refresh/refresh.service';
import { Subject, Subscription, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component
export default class RefreshSelectorMixin extends Vue {
  @Inject('refreshService') protected refreshService: () => RefreshService;

  // htmlActiveRefreshTime allow us to update dynamically refresh button content html
  htmlActiveRefreshTime = '';
  activeRefreshTime: number;
  refreshTimes: number[] = [0, 5, 10, 30, 60, 300];
  refreshTimer?: Subscription;
  unsubscribeFromRefreshMixin$ = new Subject();

  public mounted(): void {
    this.activeRefreshTime = this.refreshService().getSelectedRefreshTime();
    this.htmlActiveRefreshTime = this.getActiveRefreshTime();
    this.refreshService()
      .refreshChanged$.pipe(takeUntil(this.unsubscribeFromRefreshMixin$))
      .subscribe(() => this.launchTimer(true));
    this.launchTimer(false);
  }

  manualRefresh(): void {
    this.refreshService().refreshReload();
  }

  /** Change active time only if exists, else 0 **/
  setActiveRefreshTime(time: number): void {
    if (time && this.refreshTimes.findIndex(t => t === time) !== -1) {
      this.activeRefreshTime = time;
    } else {
      this.activeRefreshTime = this.refreshTimes[0];
    }
    this.refreshService().storeSelectedRefreshTime(time);
    this.refreshService().refreshChanged();
  }

  /** Init the timer **/
  subscribe(): void {
    if (this.activeRefreshTime && this.activeRefreshTime > 0) {
      this.refreshTimer = interval(this.activeRefreshTime * 1000)
        .pipe(takeUntil(this.unsubscribeFromRefreshMixin$))
        .subscribe(() => {
          this.refreshService().refreshReload();
        });
    }
  }

  /** Launch (or relaunch if true) the timer. **/
  launchTimer(relaunch: boolean): void {
    if (relaunch && this.refreshTimer) {
      this.refreshTimer.unsubscribe();
    }
    this.subscribe();
  }

  /* istanbul ignore next */
  beforeDestroy(): any {
    // prevent memory leak when component destroyed
    this.unsubscribeFromRefreshMixin$.next();
    this.unsubscribeFromRefreshMixin$.complete();
  }

  classTime(): string {
    if (this.activeRefreshTime <= 0) {
      return 'fa fa-pause';
    }
    return 'fa fa-repeat';
  }

  stateTime(time: number): string | void {
    if (time === this.activeRefreshTime) {
      return 'active';
    }
  }

  getActiveRefreshTime(): string {
    if (this.activeRefreshTime <= 0) {
      return 'disabled';
    }
    return this.activeRefreshTime + ' sec.';
  }
}
