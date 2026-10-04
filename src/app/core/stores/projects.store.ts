import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { computed, effect, inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, of, pipe, switchMap, tap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ProjectsService } from '../services/projects/projects.service';
import { Project, ProjectsServerResponse } from '../models/project.model';

type ProjectsState = {
  projects: Project[];
  meta: ProjectsServerResponse['meta'] | null;
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  pageSize: number;
  searchQuery: string;
  statusFilter: string;
};

const initialState: ProjectsState = {
  projects: [],
  meta: null,
  isLoading: false,
  error: null,
  currentPage: 1,
  pageSize: 10,
  searchQuery: '',
  statusFilter: 'all',
};

export const ProjectsStore = signalStore(
  { providedIn: 'root' },
  withState<ProjectsState>(initialState),
  withComputed((state) => ({
    totalItems: computed(() => state.meta()?.totalItems ?? 0),
    filteredMetrics: computed(() => state.meta()?.filteredMetrics ?? null),
  })),
  withMethods((store, projectsService = inject(ProjectsService)) => ({
    setPage(page: number) {
      patchState(store, { currentPage: page });
    },
    setPageSize(size: number) {
      patchState(store, { pageSize: size, currentPage: 1 });
    },
    setSearchQuery(query: string) {
      patchState(store, { searchQuery: query, currentPage: 1 });
    },
    setStatusFilter(status: string) {
      patchState(store, { statusFilter: status, currentPage: 1 });
    },
    loadProjects: rxMethod<{ page: number; limit: number; search: string; status: string }>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(({ page, limit, search, status }) =>
          projectsService.getProjects(page, limit, search, status).pipe(
            tap((response) => {
              patchState(store, {
                projects: response.data,
                meta: response.meta,
                isLoading: false,
              });
            }),
            catchError((err: unknown) => {
              const message =
                err instanceof HttpErrorResponse
                  ? (err.error as { message?: string } | undefined)?.message
                  : undefined;
              patchState(store, {
                isLoading: false,
                error: message || 'Failed to load projects',
              });
              return of(null);
            }),
          ),
        ),
      ),
    ),
    refresh() {
      // A way to manually trigger a refresh by just patching the state with the same values,
      // or we can just call loadProjects directly. Since we use effect in onInit,
      // we can't easily trigger the effect unless a signal changes.
      // So we can expose a reload method.
    },
  })),
  withHooks({
    onInit(store) {
      effect(() => {
        const page = store.currentPage();
        const limit = store.pageSize();
        const search = store.searchQuery();
        const status = store.statusFilter();

        store.loadProjects({ page, limit, search, status });
      });
    },
  }),
);
