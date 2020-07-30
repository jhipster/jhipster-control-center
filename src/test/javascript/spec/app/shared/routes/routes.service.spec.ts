import { createLocalVue } from '@vue/test-utils';
import * as config from '@/shared/config/config';
import RoutesService from '@/shared/routes/routes.service';
import axios from 'axios';
import { jhcc_route, routes } from '../../../fixtures/jhcc.fixtures';

const localVue = createLocalVue();
const store = config.initVueXStore(localVue);

const mockedAxios: any = axios;
jest.mock('axios', () => ({
  get: jest.fn(),
}));

describe('Routes service', () => {
  let routesService: RoutesService;

  it('should init service', () => {
    routesService = new RoutesService(store);
    expect(store.getters.route).toEqual(jhcc_route);
  });

  it('should get selected route from store', () => {
    routesService = new RoutesService(store);
    const selectedRoute = routesService.getSelectedRoute();
    expect(selectedRoute).toEqual(jhcc_route);
  });

  it('should set route in the store', () => {
    routesService = new RoutesService(store);
    routesService.storeSelectedRoute(jhcc_route);
    expect(store.getters.route).toEqual(jhcc_route);
  });

  it('should return Spring Cloud Gateway routes', async () => {
    mockedAxios.get.mockImplementationOnce(() => Promise.resolve(routes));
    routesService = new RoutesService(store);
    routesService.findAllRoutes().subscribe(res => {
      expect(res).toBe(routes);
    });
  });
});
