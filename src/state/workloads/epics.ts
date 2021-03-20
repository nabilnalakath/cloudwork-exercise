import { combineEpics, Epic } from 'redux-observable';
import { filter, mergeMap, map,tap} from 'rxjs/operators';
import { isActionOf } from 'typesafe-actions';

import { RootAction, RootState } from '../reducer';
import * as workloadsActions from './actions';

import { WorkloadService } from './services'

const workloadService = new WorkloadService
type AppEpic = Epic<RootAction, RootAction, RootState>;

const logWorkloadSubmissions: AppEpic = (action$, state$) => (
  action$.pipe(
    filter(isActionOf(workloadsActions.submit)),
    map((action) => action.payload),
    tap((payload) => console.log('Workload submitted', payload)),
    mergeMap(({ complexity }) =>
      workloadService
        .create({ complexity })
        .then((workload) => {
          return workloadsActions.created(workload);
        })
    ),
  )
);


export const epics = combineEpics(
   logWorkloadSubmissions,
);

export default epics;
