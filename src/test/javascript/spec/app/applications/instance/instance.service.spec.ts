import InstanceService, { Instance } from '@/applications/instance/instance.service';
import { Observable } from 'rxjs';
import axios from 'axios';

const mockedAxios: any = axios;
jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

const data: Array<any> = [
  {
    serviceId: 'app1',
    instanceId: 'app1-id',
    uri: 'http://127.0.0.1:8080',
    host: '127.0.0.1',
    port: 8080,
    secure: false,
    metadata: {},
  },
  {
    serviceId: 'app2',
    instanceId: 'app2-id',
    uri: 'http://127.0.0.1:8081',
    host: '127.0.0.1',
    port: 8080,
    secure: false,
    metadata: {},
  },
];

describe('Instance Service', () => {
  let instanceService: InstanceService;

  beforeEach(() => {
    instanceService = new InstanceService();
    mockedAxios.get.mockReset();
  });

  it('should get list of instances', async () => {
    const spy = jest.spyOn(instanceService, 'findAll').mockReturnValue(Observable.of(data));

    expect(
      instanceService.findAll().subscribe(res => {
        expect(res).toEqual(data);
      })
    );
    expect(instanceService.parseJsonArrayInstancesToArray(data)).toHaveLength(2);
    expect(spy).toHaveBeenCalled();
  });

  it('should get list of gateway route', async () => {
    const routes = [
      {
        route_id: 'app1:id',
        serviceId: 'app1',
        otherData: 'test',
      },
      {
        route_id: 'app2:id',
        serviceId: 'app2',
        otherData: 'test',
      },
    ];
    mockedAxios.get.mockImplementationOnce(() => Promise.resolve(routes));

    await expect(instanceService.findAllGatewayRoute()).resolves.toEqual(routes);
    expect(mockedAxios.get).toHaveBeenCalledWith('management/gateway/routes');
  });

  it('should get data error from this request', async () => {
    const error = 'an error';
    mockedAxios.get.mockImplementationOnce(() => Promise.reject(error));

    await expect(instanceService.findAllGatewayRoute()).rejects.toEqual(error);
    expect(mockedAxios.get).toHaveBeenCalledWith('management/gateway/routes');
  });

  it('should get data profiles of an application', async () => {
    const profiles = { 'display-ribbon-on-profiles': 'dev', activeProfiles: ['dev', 'test'] };
    const route = 'test/test-id';
    mockedAxios.get.mockImplementationOnce(() => Promise.resolve(profiles));

    await expect(instanceService.findActiveProfiles(route)).resolves.toEqual(profiles);
    expect(mockedAxios.get).toHaveBeenCalledWith('gateway/test/test-id/management/info');
  });

  it('should get data error from this request', async () => {
    const error = 'an error';
    const route = 'test/test-id';
    mockedAxios.get.mockImplementationOnce(() => Promise.reject(error));

    await expect(instanceService.findActiveProfiles(route)).rejects.toEqual(error);
    expect(mockedAxios.get).toHaveBeenCalledWith('gateway/test/test-id/management/info');
  });

  it('should make a post request to the shutdown actuator endpoint', async () => {
    const instance = data[0];
    const returnValue = {
      message: 'Shutting down, bye...',
    };
    mockedAxios.post.mockReturnValue(Promise.resolve(returnValue));

    await expect(instanceService.shutdownInstance(instance)).resolves.toEqual(returnValue);
    expect(mockedAxios.post).toHaveBeenCalledWith('/gateway/app1/app1-id/management/shutdown');
  });
});
