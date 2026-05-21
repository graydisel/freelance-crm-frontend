export interface  ITask {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "done";
}

export interface IProject {
  id: string;
  name: string;
  clientName: string;
  budget: number;
  tasks: ITask[];
}
