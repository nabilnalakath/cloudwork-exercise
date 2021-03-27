import { combineEpics, Epic } from 'redux-observable';
import { of } from 'rxjs'
import { filter, map, tap, mergeMap, takeUntil, delay, mapTo, ignoreElements, take, takeWhile } from 'rxjs/operators';
import { isActionOf } from 'typesafe-actions';
import { CANCEL } from './constants';

import { RootAction, RootState } from '../reducer';
import * as workloadsActions from './actions';
import { WorkloadService } from '././services';

const service = new WorkloadService()


type AppEpic = Epic<RootAction, RootAction, RootState>;


const logWorkloadSubmissions: AppEpic = (action$, state$) => (
  action$.pipe(
    filter(isActionOf(workloadsActions.submit)),
    map(action => action.payload),
    tap((payload) => console.log('Workload submitted', payload)),
    mergeMap(payload => service.create(payload).then(res => {
      console.log(res);
      return workloadsActions.created(res) //dispatching action
    })),
    // ignoreElements(),
  )
);

const cancelWorkload: AppEpic = (action$, state$) => (
  action$.pipe(
    filter(isActionOf(workloadsActions.cancel)),
    map(action => action.payload),
    tap((payload) => console.log('Workload cancelled', payload)),
    mergeMap(payload => service.cancel(payload).then(res => {
      return workloadsActions.updateStatus({ ...res, status: 'CANCELED' })
    })),
    // ignoreElements(),
  )
);

const workloadCreated: AppEpic = (action$, state$) => (
  action$.pipe(
    filter(isActionOf(workloadsActions.created)),
    map(action => action.payload),
    tap((payload) => console.log('Workload created', payload)),
    mergeMap((payload) => {
      return of(
        workloadsActions.checkStatus(payload)
      ).pipe(
        takeUntil(action$.pipe(
          filter(isActionOf(workloadsActions.cancel))
        )),
        delay(payload.complexity * 1000),
        takeWhile((value) => {
          const workload = state$.value.workloads[value.payload.id];
          console.log(workload)
          return workload.status === 'WORKING';
        })

      )
    }),
    // ignoreElements(),
  )
);

const workloadCheckStatus: AppEpic = (action$, state$) => (
  action$.pipe(
    filter(isActionOf(workloadsActions.checkStatus)),
    map(action => action.payload),
    tap((payload) => console.log('Workload updated', payload)),
    mergeMap(async (payload) => {
      const { status } = await service.checkStatus(payload);
      console.log(status)
      return workloadsActions.updateStatus({ ...payload, status })
    }),
    // ignoreElements(),
  )
);

export const epics = combineEpics(
  logWorkloadSubmissions,
  cancelWorkload,
  workloadCreated,
  workloadCheckStatus
);

export default epics;
