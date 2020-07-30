import { Store } from 'vuex';
import { Subject, Observable } from 'rxjs';

export class RefreshService {
  private store: Store<{}>;

  // Observable sources
  private refreshChangedSource = new Subject<any>();
  private refreshReloadSource = new Subject<any>();
  refreshChanged$: Observable<any>;
  refreshReload$: Observable<any>;

  constructor(store: Store<{}>) {
    this.store = store;
    this.refreshChanged$ = this.refreshChangedSource.asObservable();
    this.refreshReload$ = this.refreshReloadSource.asObservable();
  }

  refreshChanged(): void {
    this.refreshChangedSource.next();
  }

  refreshReload(): void {
    this.refreshReloadSource.next();
  }

  getSelectedRefreshTime(): number {
    return this.store.getters.refreshTime;
  }

  storeSelectedRefreshTime(time: number): void {
    this.store.commit('setRefreshTime', time);
  }
}
