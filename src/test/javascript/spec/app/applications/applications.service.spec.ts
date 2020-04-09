import ApplicationsService from '@/applications/applications.service';
import axios from 'axios';

const mockedAxios: any = axios;
jest.mock('axios', () => ({
  get: jest.fn()
}));

describe('Applications Service', () => {
  let applicationsService: ApplicationsService;

  beforeEach(() => {
    applicationsService = new ApplicationsService();
    mockedAxios.get.mockReset();
  });

  it('should get list of applications', async () => {
    const data = {
      app1: [
        {
          instanceId: 'app1-id',
          serviceId: 'app1',
          host: '127.0.0.1',
          port: 8080,
          secure: false,
          metadata: { someData: 'test' },
          uri: 'http://127.0.0.01:8080',
          scheme: null
        }
      ],
      app2: [
        {
          instanceId: 'app2-id',
          serviceId: 'app2',
          host: '127.0.0.1',
          port: 8081,
          secure: false,
          metadata: { someData: 'test' },
          uri: 'http://127.0.0.02:8081',
          scheme: null
        }
      ]
    };
    mockedAxios.get.mockImplementationOnce(() => Promise.resolve(data));
    await expect(applicationsService.findAll()).resolves.toEqual(data);
    expect(mockedAxios.get).toHaveBeenCalledWith('api/services/instances');
  });

  it('should get data error from this request', async () => {
    const error = 'an error';
    mockedAxios.get.mockImplementationOnce(() => Promise.reject(error));

    await expect(applicationsService.findAll()).rejects.toEqual(error);
    expect(mockedAxios.get).toHaveBeenCalledWith('api/services/instances');
  });

  it('should get list of gateway route', async () => {
    const data = [
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
    mockedAxios.get.mockImplementationOnce(() => Promise.resolve(data));

    await expect(applicationsService.findAllGatewayRoute()).resolves.toEqual(data);
    expect(mockedAxios.get).toHaveBeenCalledWith('management/gateway/routes');
  });

  it('should get data error from this request', async () => {
    const error = 'an error';
    mockedAxios.get.mockImplementationOnce(() => Promise.reject(error));

    await expect(applicationsService.findAllGatewayRoute()).rejects.toEqual(error);
    expect(mockedAxios.get).toHaveBeenCalledWith('management/gateway/routes');
  });

  it('should get data profiles of an application', async () => {
    const data = { 'display-ribbon-on-profiles': 'dev', activeProfiles: ['dev', 'test'] };
    const route = 'test/test-id';
    mockedAxios.get.mockImplementationOnce(() => Promise.resolve(data));

    await expect(applicationsService.findActiveProfiles(route)).resolves.toEqual(data);
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
