import './style.css';

import { of, map, Observable, from, toArray, forkJoin } from 'rxjs';
import { switchMap } from 'rxjs/operators';

// use interface instead class for TS
export interface Task {
  goal_id: string;
  name: string;
  description: string;
  priority: string;
  taskDate: string;
  id: string; // key collection
}

export interface TaskWithGoalCategory extends Task {
  goalCategory: string;
}

// Base Goal Model
export interface Goal {
  name: string;
  isMainGoal: boolean;
  details: string;
  category: string;
  lifeArea: string;
  creationDate: string;
  priority: string;
  endDate: Date;
  id: string;
}

const mockTasks: Task[] = [
  {
    goal_id: 'goal_id',
    id: 'task_id',
  },
  {
    goal_id: 'goal_id',
    id: 'task_id2',
  },
] as Task[];

const mockGoals: Goal[] = [
  {
    name: 'goal',
    category: 'Super Boal',
    id: 'goal_id',
  },
] as Goal[];

class Service {
  tasksCollection(): Observable<Task[]> {
    // don't use ANY!!!!!
    return of(mockTasks);
  }

  getGoalById(id: string): Observable<Goal> {
    // this method should fetch goal by id directly
    // and cache it to not triger multiple calls for the same goal_id
    return this.goalsCollection().pipe(
      map((response) => {
        response = response.filter((v: any) => v.id === id);
        return response[0];
      })
    );
  }

  goalsCollection(): Observable<Goal[]> {
    return of(mockGoals);
  }
}

export class DashboardComponent {
  allTasks: Task[] = [];

  service = new Service();

  taskCollectionWithGoalCategory$ = this.service
    .tasksCollection()
    .pipe(
      map((tasksArray) => {
        return tasksArray.map(async (item: any) => {
          return {
            ...item,
            goalCategory: await this.getGoalCategory(item),
          };
        });
      })
    )
    .subscribe(async (tasks: Promise<Task>[]) => {
      const completedTasks = await Promise.all(tasks);
      this.allTasks = completedTasks;
      console.log(this.allTasks);
    });

  getGoalCategory(item: any) {
    return new Promise((res) => {
      this.service.getGoalById(item.goal_id).subscribe((d) => {
        res(d.category);
      });
    });
  }
}

const comp = new DashboardComponent();
comp.taskCollectionWithGoalCategory$; // subscribe in template directly
