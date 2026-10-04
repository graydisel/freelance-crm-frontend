import { inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
  withHooks,
} from '@ngrx/signals';
import { computed } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, of, pipe, switchMap, tap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { DashboardService } from '../services/dashboard/dashboard.service';
import { DashboardMetrics } from '../models/dashboard.model';

type DashboardState = {
  metrics: DashboardMetrics;
  isLoading: boolean;
  error: string | null;
};

const emptyMetrics: DashboardMetrics = {
  activeClientsCount: 0,
  leadsCount: 0,
  archivedClientsCount: 0,
  totalRevenue: 0,
  projectsPlanning: 0,
  projectsActive: 0,
  projectsDone: 0,
  tasksCompleted: 0,
  tasksTotal: 0,
  recentClients: [],
  topProjects: [],
};

const initialState: DashboardState = {
  metrics: emptyMetrics,
  isLoading: false,
  error: null,
};

export const DashboardStore = signalStore(
  { providedIn: 'root' },
  withState<DashboardState>(initialState),
  withComputed((state) => ({
    tasksProgress: computed(() => {
      const { tasksTotal, tasksCompleted } = state.metrics();
      return tasksTotal === 0 ? 0 : tasksCompleted / tasksTotal;
    }),
    summaryText: computed(() => {
      const { activeClientsCount, projectsActive, tasksCompleted } = state.metrics();
      return `${activeClientsCount} active clients · ${projectsActive} live projects · ${tasksCompleted} tasks completed this quarter`;
    }),
  })),
  withMethods((store, dashboardService = inject(DashboardService)) => ({
    loadData: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(() =>
          dashboardService.getDashboardData().pipe(
            tap((metrics) => {
              patchState(store, { metrics, isLoading: false });
            }),
            catchError((err: unknown) => {
              const message =
                err instanceof HttpErrorResponse
                  ? (err.error as { message?: string } | undefined)?.message
                  : undefined;
              patchState(store, {
                isLoading: false,
                error: message || 'Failed to load dashboard data',
              });
              return of(null);
            }),
          ),
        ),
      ),
    ),
  })),
  withHooks({
    onInit(store) {
      store.loadData();
    },
  }),
);
