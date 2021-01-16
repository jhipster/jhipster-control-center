import axios from 'axios';
import { Route } from '@/shared/routes/routes.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import AbstractService from '@/applications/abstract.service';

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

export default class ConfigurationService extends AbstractService {
  /** return beans of a route */
  public findBeans(route: Route): Observable<Bean[]> {
    return new Observable(observer => {
      const url = this.generateUri(route, '/management/configprops/');

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
    return new Observable(observer => {
      const url = this.generateUri(route, '/management/env/');

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
