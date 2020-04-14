import ApplicationsService, { Application } from '@/applications/applications.service';
import axios from 'axios';
import { Observable } from 'rxjs';

const mockedAxios: any = axios;
jest.mock('axios', () => ({
  get: jest.fn()
}));

const data: Array<any> = [
  {
    serviceId: 'app1',
    instance: {
      instanceId: 'app1-id',
      serviceId: 'app1',
      port: 8080,
      secure: false,
      metadata: { someData: 'test' },
      uri: 'http://127.0.0.01:8080'
    }
  },
  {
    serviceId: 'app2',
    instance: {
      instanceId: 'app2-id',
      serviceId: 'app2',
      port: 8081,
      secure: false,
      metadata: { someData: 'test' },
      uri: 'http://127.0.0.02:8081'
    }
  }
];

describe('Applications Service', () => {
  let applicationsService: ApplicationsService;

  beforeEach(() => {
    applicationsService = new ApplicationsService();
    mockedAxios.get.mockReset();
  });

  it('should get list of applications', async () => {
    const spy = jest.spyOn(applicationsService, 'findAll').mockReturnValue(Observable.of(data));

    expect(
      applicationsService.findAll().subscribe(res => {
        expect(res).toEqual(data);
      })
    );
    expect(applicationsService.parseJsonArrayApplicationsToArray(data)).toHaveLength(2);
    expect(spy).toHaveBeenCalled();
  });

  it('should get list of gateway route', async () => {
    const routes = [
      {
        route_id: 'app1:id',
        serviceId: 'app1',
        otherData: 'test'
      },
      {
        route_id: 'app2:id',
        serviceId: 'app2',
        otherData: 'test'
      }
    ];
    mockedAxios.get.mockImplementationOnce(() => Promise.resolve(routes));

    await expect(applicationsService.findAllGatewayRoute()).resolves.toEqual(routes);
    expect(mockedAxios.get).toHaveBeenCalledWith('management/gateway/routes');
  });

  it('should get data error from this request', async () => {
    const error = 'an error';
    mockedAxios.get.mockImplementationOnce(() => Promise.reject(error));

    await expect(applicationsService.findAllGatewayRoute()).rejects.toEqual(error);
    expect(mockedAxios.get).toHaveBeenCalledWith('management/gateway/routes');
  });

  it('should get data profiles of an application', async () => {
    const profiles = { 'display-ribbon-on-profiles': 'dev', activeProfiles: ['dev', 'test'] };
    const route = 'test/test-id';
    mockedAxios.get.mockImplementationOnce(() => Promise.resolve(profiles));

    await expect(applicationsService.findActiveProfiles(route)).resolves.toEqual(profiles);
    expect(mockedAxios.get).toHaveBeenCalledWith('gateway/test/test-id/management/info');
  });

  it('should get data error from this request', async () => {
    const error = 'an error';
    const route = 'test/test-id';
    mockedAxios.get.mockImplementationOnce(() => Promise.reject(error));

    await expect(applicationsService.findActiveProfiles(route)).rejects.toEqual(error);
    expect(mockedAxios.get).toHaveBeenCalledWith('gateway/test/test-id/management/info');
  });
});
