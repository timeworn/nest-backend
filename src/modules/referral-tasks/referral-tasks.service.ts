import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Point } from 'geojson';
import { Repository } from 'typeorm';
import { AbstractService } from '../../shared/services/abstract-service.service';
import { CreateReferralTaskDto } from './dto/create-referral-task.dto';
import { UpdateReferralTaskDto } from './dto/update-referral-task.dto';
import { ReferralTask } from './entities/referral-task.entity';
import { ReferralTaskStatus } from './enums/referral-task-status.enum';

@Injectable()
export class ReferralTasksService extends AbstractService<ReferralTask> {
  constructor(@InjectRepository(ReferralTask) private readonly referralSettingRepo: Repository<ReferralTask>) {
    super();
    this.repository = this.referralSettingRepo;
    this.modelName = 'Referral Setting';
  }

  async create(createReferralTaskDto: CreateReferralTaskDto) {
    const { lat, lng, country } = createReferralTaskDto;
    const location: Point = {
      type: 'Point',
      coordinates: [lng, lat],
    };

    const existingReferralTask = await this.referralSettingRepo.findOne({
      where: {
        status: 'Active',
        country,
      },
    });

    if (existingReferralTask) throw new BadRequestException('A referral task for this country is already in progress');

    return super.create({ ...createReferralTaskDto, location });
  }

  async update(id: string, updateReferralTaskDto: UpdateReferralTaskDto) {
    const referralTask = await this.findOne(id);

    await super.update(id, updateReferralTaskDto);

    // if(referralTask.status == ReferralTaskStatus.Active || referralTask.status == ReferralTaskStatus.Pending)  {

    // }

    return this.findOne(id);
  }
}
