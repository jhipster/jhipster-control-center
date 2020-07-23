import { Component, Vue, Inject } from 'vue-property-decorator';
import numeral from 'numeral';
import JhiMetricModal from './metric-modal.vue';
import MetricService, { Metrics, ThreadDump } from './metric.service';
import RoutesService, { Route } from '@/shared/routes/routes.service';
import { RefreshService } from '@/shared/refresh/refresh.service';
import { takeUntil, map, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import RoutesSelectorVue from '@/shared/routes/routes-selector.vue';
import RefreshSelectorVue from '@/shared/refresh/refresh-selector.mixin.vue';
import AbstractComponent from '@/applications/abstract.component';

@Component({
  components: {
    'refresh-selector': RefreshSelectorVue,
    'routes-selector': RoutesSelectorVue,
    'metrics-modal': JhiMetricModal,
  },
})
export default class JhiMetric extends AbstractComponent {
  public metrics: any = {};
  public threads: any = null;
  public threadStats: any = {};
  public updatingMetrics = true;
  public activeRoute?: Route;
  public routes?: Route[];

  unsubscribe$ = new Subject();

  @Inject('metricService') private metricService: () => MetricService;
  @Inject('routesService') private routesService: () => RoutesService;
  @Inject('refreshService') private refreshService: () => RefreshService;

  public mounted(): void {
    this.routesService()
      .routeChanged$.pipe(takeUntil(this.unsubscribe$))
      .subscribe(route => {
        this.activeRoute = route;
        this.refresh();
      });
  }

  /** refresh all metrics */
  public refresh(): void {
    this.metricService()
      .findAll(this.activeRoute)
      .pipe(
        takeUntil(this.unsubscribe$),
        switchMap((metrics: Metrics) =>
          this.metricService()
            .findAllThreadDump(this.activeRoute)
            .pipe(
              takeUntil(this.unsubscribe$),
              map((threadDump: ThreadDump) => {
                this.metrics = metrics;
                this.threads = threadDump.threads;
                this.refreshThreadStats();
                this.updatingMetrics = false;
              })
            )
        )
      )
      .subscribe(
        () => {
          this.resetError();
        },
        error => (this.error = error)
      );
  }

  /** open modal for thread's metrics */
  openModal(): void {
    if ((<any>this.$refs.metricsModal).show) {
      (<any>this.$refs.metricsModal).show();
    }
  }

  filterNaN(input: any): any {
    if (isNaN(input)) {
      return 0;
    }
    return input;
  }

  formatNumber1(value: any): any {
    return numeral(value).format('0,0');
  }

  formatNumber2(value: any): any {
    return numeral(value).format('0,00');
  }

  convertMillisecondsToDuration(ms) {
    const times = {
      year: 31557600000,
      month: 2629746000,
      day: 86400000,
      hour: 3600000,
      minute: 60000,
      second: 1000,
    };
    let time_string = '';
    let plural = '';
    for (const key in times) {
      if (Math.floor(ms / times[key]) > 0) {
        if (Math.floor(ms / times[key]) > 1) {
          plural = 's';
        } else {
          plural = '';
        }
        time_string += Math.floor(ms / times[key]).toString() + ' ' + key.toString() + plural + ' ';
        ms = ms - times[key] * Math.floor(ms / times[key]);
      }
    }
    return time_string;
  }

  public isMetricKeyExists(metrics: any, key: string): boolean {
    return metrics && metrics[key];
  }

  public isObjectExistingAndNotEmpty(metrics: any, key: string): boolean {
    return this.isMetricKeyExists(metrics, key) && JSON.stringify(metrics[key]) !== '{}';
  }

  /** refresh thread's metrics from current threads data */
  private refreshThreadStats(): void {
    this.threadStats = {
      threadDumpRunnable: 0,
      threadDumpWaiting: 0,
      threadDumpTimedWaiting: 0,
      threadDumpBlocked: 0,
      threadDumpAll: 0,
    };

    this.threads.forEach(value => {
      if (value.threadState === 'RUNNABLE') {
        this.threadStats.threadDumpRunnable += 1;
      } else if (value.threadState === 'WAITING') {
        this.threadStats.threadDumpWaiting += 1;
      } else if (value.threadState === 'TIMED_WAITING') {
        this.threadStats.threadDumpTimedWaiting += 1;
      } else if (value.threadState === 'BLOCKED') {
        this.threadStats.threadDumpBlocked += 1;
      }
    });

    this.threadStats.threadDumpAll =
      this.threadStats.threadDumpRunnable +
      this.threadStats.threadDumpWaiting +
      this.threadStats.threadDumpTimedWaiting +
      this.threadStats.threadDumpBlocked;
  }

  /* istanbul ignore next */
  beforeDestroy(): void {
    // prevent memory leak when component destroyed
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
