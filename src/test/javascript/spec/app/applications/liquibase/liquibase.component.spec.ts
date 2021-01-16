import axios from 'axios';
import { Observable } from 'rxjs';
import { BootstrapVue } from 'bootstrap-vue';
import * as config from '@/shared/config/config';
import RoutesService from '@/shared/routes/routes.service';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { RefreshService } from '@/shared/refresh/refresh.service';
import LiquibaseVue from '@/applications/liquibase/liquibase.vue';
import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils';
import LiquibaseService from '@/applications/liquibase/liquibase.service';
import LiquibaseComponent from '@/applications/liquibase/liquibase.component';
import {
  jhcc_liquibase_changesets,
  jhcc_liquibase_changesets_json,
  jhcc_route,
  routes,
  stubbedModal,
} from '../../../fixtures/jhcc.fixtures';

const localVue = createLocalVue();
localVue.component('font-awesome-icon', FontAwesomeIcon);
localVue.use(BootstrapVue);

config.initVueApp(localVue);
const store = config.initVueXStore(localVue);

const liquibaseService = new LiquibaseService();
const refreshService = new RefreshService(store);
const routesService = new RoutesService(store);
routesService.routeChanged$ = new Observable(subscriber => {
  subscriber.next(jhcc_route);
});
routesService.routesChanged$ = new Observable(subscriber => {
  subscriber.next(routes);
});

const mockedAxios: any = axios;
jest.mock('axios', () => ({
  get: jest.fn(),
}));

describe('liquibase component', () => {
  let wrapper: Wrapper<LiquibaseComponent>;
  let liquibaseComponent: LiquibaseComponent;

  beforeEach(() => {
    mockedAxios.get.mockReturnValueOnce(Promise.resolve({ data: jhcc_liquibase_changesets_json }));
    wrapper = shallowMount<LiquibaseComponent>(LiquibaseVue, {
      store,
      localVue,
      stubs: {
        bModal: stubbedModal,
      },
      provide: {
        liquibaseService: () => liquibaseService,
        routesService: () => routesService,
        refreshService: () => refreshService,
      },
    });
    liquibaseComponent = wrapper.vm;
  });

  it('when component is mounted', async () => {
    mockedAxios.get.mockReturnValueOnce(Promise.resolve({ data: jhcc_liquibase_changesets_json }));
    const subscribeRouteChanged = jest.spyOn(routesService.routeChanged$, 'subscribe');
    const subscribeRoutesChanged = jest.spyOn(routesService.routesChanged$, 'subscribe');
    const wrapperToTestMounted = shallowMount<LiquibaseComponent>(LiquibaseVue, {
      store,
      localVue,
      provide: {
        liquibaseService: () => liquibaseService,
        routesService: () => routesService,
        refreshService: () => refreshService,
      },
    });
    const liquibaseToTestMounted = wrapperToTestMounted.vm;
    await liquibaseToTestMounted.$nextTick();
    expect(subscribeRouteChanged).toHaveBeenCalled();
    expect(subscribeRoutesChanged).toHaveBeenCalled();
    expect(liquibaseToTestMounted.activeRoute).toBe(jhcc_route);
    expect(mockedAxios.get).toHaveBeenCalledWith('/management/liquibase/');
    expect(liquibaseToTestMounted.changeSets).toEqual(jhcc_liquibase_changesets);
  });

  it('should change order and invert reverse', () => {
    liquibaseComponent.changeOrder('test-order');
    expect(liquibaseComponent.orderProp).toEqual('test-order');
    expect(liquibaseComponent.reverse).toBe(true);
  });

  it('should load page if we change page from pagination changesets list', () => {
    liquibaseComponent.page = 1;
    liquibaseComponent.previousPage = 1;
    const paginate = jest.spyOn(liquibaseComponent, 'paginate');

    liquibaseComponent.loadPage(2);

    expect(liquibaseComponent.previousPage).toEqual(2);
    expect(paginate).toHaveBeenCalledWith(2);
  });

  it('should clear pagination and go to first page of pagination changesets list', () => {
    liquibaseComponent.page = 3;
    const paginate = jest.spyOn(liquibaseComponent, 'paginate');

    liquibaseComponent.clearPagination();

    expect(liquibaseComponent.page).toEqual(1);
    expect(liquibaseComponent.previousPage).toEqual(1);
    expect(paginate).toHaveBeenCalledWith(1);
  });

  it('should call show from detailModal', async () => {
    const spy = jest.spyOn(<any>liquibaseComponent.$refs.detailModal, 'show');
    await liquibaseComponent.showDetail(jhcc_liquibase_changesets[0]);
    await liquibaseComponent.$nextTick();
    expect(spy).toBeCalled();
    spy.mockRestore();
  });
});
