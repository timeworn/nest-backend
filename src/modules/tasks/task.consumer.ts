import { TasksService } from './tasks.service';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { TaskStatus } from './enums/task-status.enum';
import { Task } from './entities/task.entity';
import { Helper } from '../../shared/helpers';
import { TaskTypes } from './enums/task-types.enum';

@Processor('task')
export class TaskConsumer {
  constructor(private taskService: TasksService) {}

  @Process()
  async handleComplete(job: Job<Task>) {
    const task = await this.taskService.findOne(job.data.id);
    // const expiryDate = Helper.dayjs(task.createdAt).add(task.duration, 'day');
    // if (expiryDate.isBefore(Helper.dayjs())) {
    //   task.status = TaskStatus.EXPIRED;
    //   await task.save();
    // }

    await this.taskService.complete(task.id, {});

    return {};
  }
}
