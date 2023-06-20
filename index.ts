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
        response = response.filter((v: Goal) => v.id === id);
        return response[0];
      })
    );
  }

  goalsCollection(): Observable<Goal[]> {
    return of(mockGoals);
  }
}

export class DashboardComponent {
  service = new Service();

  taskCollectionWithGoalCategory$: Observable<TaskWithGoalCategory[]> =
    this.service.tasksCollection().pipe(
      switchMap((tasks) => {
        return from(tasks).pipe(
          // LEARN RXJS
          switchMap((task) =>
            this.service
              .getGoalById(task.goal_id) // this will produce for each task call to backend for goals collection  - not good
              .pipe(map((goal) => ({ ...task, goalCategory: goal.category })))
          )
        );
      }),
      toArray()
    );

  taskCollectionWithGoalCategory2$: Observable<TaskWithGoalCategory[]> =
    forkJoin({
      tasks: this.service.tasksCollection(),
      goals: this.service.goalsCollection(),
    }).pipe(
      map(({ tasks, goals }) => {
        return tasks.map((task) => {
          const goal: Goal = goals.find((goal) => goal.id === task.goal_id);

          return {
            ...task,
            goalCategory: goal.category,
          };
        });
      })
    );
}

const comp = new DashboardComponent();
comp.taskCollectionWithGoalCategory$.subscribe(console.log); // subscribe in template directly

console.log('second use without so many backend calls for goals collection');
comp.taskCollectionWithGoalCategory2$.subscribe(console.log);
