import axios from 'axios';
import { Observable } from 'rxjs';
import AbstractService from '../abstract.service';
import { Route } from '@/shared/routes/routes.service';

export class ChangeSet {
  constructor(
    public author: string,
    public changeLog: string,
    public comments: string,
    public contexts: string[],
    public dateExecuted: string,
    public deploymentId: string,
    public description: string[],
    public execType: string,
    public id: string,
    public labels: any[],
    public checksum: string,
    public orderExecuted: number,
    public tag: null,
    public parentId: null
  ) {}
}

export default class LiquibaseService extends AbstractService {
  public static parseJsonToArrayOfChangeSet(data: any): ChangeSet[] {
    const changeSets: ChangeSet[] = [];
    Object.keys(data.contexts).forEach(contextName => {
      const context = data.contexts[contextName];
      const parentId = data.contexts[contextName].parentId;
      try {
        context.liquibaseBeans.liquibase.changeSets.forEach(changeSet => {
          changeSets.push(
            new ChangeSet(
              changeSet.author,
              changeSet.changeLog,
              changeSet.comments,
              changeSet.contexts,
              new Date(changeSet.dateExecuted).toLocaleDateString(),
              changeSet.deploymentId,
              changeSet.description.split(';'),
              changeSet.execType,
              changeSet.id,
              changeSet.labels,
              changeSet.checksum,
              changeSet.orderExecuted,
              changeSet.tag,
              parentId
            )
          );
        });
      } catch (error) {
        console.log('ERROR ' + error);
      }
    });
    return changeSets;
  }

  /** return all changeSet of a route */
  findAll(route: Route): Observable<ChangeSet[]> {
    return new Observable(observer => {
      const url = this.generateUri(route, '/management/liquibase/');

      axios
        .get(url)
        .then(res => {
          const changeSets: ChangeSet[] = LiquibaseService.parseJsonToArrayOfChangeSet(res.data);
          observer.next(changeSets);
          observer.complete();
        })
        .catch(error => {
          observer.error(error);
        });
    });
  }
}
