import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, forkJoin, of, pipe, switchMap, tap, firstValueFrom } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ProjectsService } from '../services/projects/projects.service';
import { TaskService } from '../services/tasks/task.service';
import { Project } from '../models/project.model';
import { Task } from '../models/task.model';
import { TaskStatusEnum } from '../enums/task-status.enum';
import { TaskPriorityEnum } from '../enums/task-priority.enum';

type TasksState = {
  project: Project | null;
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  activeFilters: { priority?: string; assigneeId?: string };
};

const initialState: TasksState = {
  project: null,
  tasks: [],
  isLoading: false,
  error: null,
  activeFilters: {},
};

export const TasksStore = signalStore(
  { providedIn: 'root' },
  withState<TasksState>(initialState),
  withComputed((state) => ({
    boardGrid: computed(() => {
      const currentTasks = state.tasks();
      const grid: Record<string, Task[]> = {};
      const statuses = Object.values(TaskStatusEnum);
      const priorities = Object.values(TaskPriorityEnum);

      statuses.forEach((status) => {
        priorities.forEach((priority) => {
          grid[`${status}_${priority}`] = [];
        });
      });

      currentTasks.forEach((task) => {
        const key = `${task.status}_${task.priority}`;
        if (grid[key]) {
          grid[key].push(task);
        }
      });

      return grid;
    }),
  })),
  withMethods(
    (store, projectsService = inject(ProjectsService), taskService = inject(TaskService)) => ({
      setFilters(filters: { priority?: string; assigneeId?: string }) {
        patchState(store, { activeFilters: filters });
      },

      loadProjectAndTasks: rxMethod<string>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })) /* clear error */,
          switchMap((projectId) =>
            forkJoin({
              project: projectsService.getProject(projectId),
              tasks: taskService.getTasks(projectId),
            }).pipe(
              tap(({ project, tasks }) => {
                patchState(store, {
                  project,
                  tasks,
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
                  error: message || 'Failed to load project and tasks.',
                  project: null,
                  tasks: [],
                });
                return of(null);
              }),
            ),
          ),
        ),
      ),

      loadTasks: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap(() => {
            const id = store.project()?.id;
            if (!id) {
              patchState(store, { isLoading: false });
              return of(null);
            }

            const filters = store.activeFilters();
            const fetch$ =
              Object.keys(filters).length > 0
                ? taskService.getFilteredTasks({ projectId: id, ...filters })
                : taskService.getTasks(id);

            return fetch$.pipe(
              tap((tasks) => {
                patchState(store, { tasks, isLoading: false });
              }),
              catchError((err: unknown) => {
                const message =
                  err instanceof HttpErrorResponse
                    ? (err.error as { message?: string } | undefined)?.message
                    : undefined;
                patchState(store, {
                  isLoading: false,
                  error: message || 'Failed to load tasks.',
                });
                return of(null);
              }),
            );
          }),
        ),
      ),

      async updateTaskPosition(
        taskId: string,
        newStatus: TaskStatusEnum,
        newPriority: TaskPriorityEnum,
      ) {
        const currentTasks = store.tasks();
        const task = currentTasks.find((t) => t.id === taskId);
        if (!task) return;

        const oldStatus = task.status;
        const oldPriority = task.priority;

        patchState(store, {
          tasks: currentTasks.map((t) =>
            t.id === taskId ? { ...t, status: newStatus, priority: newPriority } : t,
          ),
        });

        try {
          await firstValueFrom(
            forkJoin([
              taskService.updateTaskStatus(taskId, newStatus),
              taskService.updateTaskPriority(taskId, newPriority),
            ]),
          );
        } catch {
          patchState(store, {
            tasks: currentTasks.map((t) =>
              t.id === taskId ? { ...t, status: oldStatus, priority: oldPriority } : t,
            ),
            error: 'Could not save task changes.',
          });
        }
      },

      async updateTaskPriority(taskId: string, newPriority: TaskPriorityEnum) {
        const currentTasks = store.tasks();
        const task = currentTasks.find((t) => t.id === taskId);
        if (!task || task.priority === newPriority) return;

        const oldPriority = task.priority;
        patchState(store, {
          tasks: currentTasks.map((t) => (t.id === taskId ? { ...t, priority: newPriority } : t)),
        });

        try {
          await firstValueFrom(taskService.updateTaskPriority(taskId, newPriority));
        } catch {
          patchState(store, {
            tasks: currentTasks.map((t) => (t.id === taskId ? { ...t, priority: oldPriority } : t)),
            error: 'Could not update task priority. Changes reverted.',
          });
        }
      },

      async deleteTask(taskId: string) {
        try {
          await firstValueFrom(taskService.deleteTask(taskId));
          // Refresh list on success
          const currentTasks = store.tasks();
          patchState(store, {
            tasks: currentTasks.filter((t) => t.id !== taskId),
          });
          return true;
        } catch {
          patchState(store, { error: 'Could not delete task.' });
          return false;
        }
      },
    }),
  ),
);
