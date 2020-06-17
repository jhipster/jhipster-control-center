import axios from 'axios';
import { Route } from '@/shared/routes/routes.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SERVER_API_URL } from '@/constants';

export interface ConfigProps {
  contexts: Contexts;
}

export interface Contexts {
  [key: string]: Context;
}

export interface Context {
  beans: Beans;
  parentId?: any;
}

export interface Beans {
  [key: string]: Bean;
}

export interface Bean {
  prefix: string;
  properties: any;
}

export interface Env {
  activeProfiles?: string[];
  propertySources: PropertySource[];
}

export interface PropertySource {
  name: string;
  properties: Properties;
}

export interface Properties {
  [key: string]: Property;
}

export interface Property {
  value: string;
  origin?: string;
}

export default class ConfigurationService {
  /** return beans of a route */
  public findBeans(route: Route): Observable<Bean[]> {
    return Observable.create(observer => {
      const beansControlCenter = (SERVER_API_URL !== undefined ? SERVER_API_URL : '') + '/management/configprops';
      const beansOfAnInstance = 'gateway/' + route.path + '/management/configprops';
      const url = route && route.path && route.path.length > 0 ? beansOfAnInstance : beansControlCenter;

      axios
        .get(url)
        .then(res => {
          observer.next(res.data);
          observer.complete();
        })
        .catch(error => {
          observer.error(error);
        });
    }).pipe(
      map((configProps: ConfigProps) =>
        Object.values(
          Object.values(configProps.contexts)
            .map(context => context.beans)
            .reduce((allBeans: Beans, contextBeans: Beans) => ({ ...allBeans, ...contextBeans }))
        )
      )
    );
  }

  /** return property sources of a route */
  public findPropertySources(route: Route): Observable<PropertySource[]> {
    return Observable.create(observer => {
      const propertySourceControlCenter = (SERVER_API_URL !== undefined ? SERVER_API_URL : '') + '/management/env';
      const propertySourceOfAnInstance = 'gateway/' + route.path + '/management/env';
      const url = route && route.path && route.path.length > 0 ? propertySourceOfAnInstance : propertySourceControlCenter;

      axios
        .get(url)
        .then(res => {
          observer.next(res.data);
          observer.complete();
        })
        .catch(error => {
          observer.error(error);
        });
    }).pipe(
      map((env: Env) => {
        return env.propertySources;
      })
    );
  }
}
