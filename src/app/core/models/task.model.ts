import {User} from './user.model';
import {TaskStatusEnum} from '../enums/task-status.enum';
import {TaskPriorityEnum} from '../enums/task-priority.enum';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatusEnum;
  priority: TaskPriorityEnum;
  creator: User;
  assignee: User;
  createdAt: string;
}
