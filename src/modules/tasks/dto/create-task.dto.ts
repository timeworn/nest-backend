import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { IsOdd } from '../../../shared/decorators/odd.decorator';
import { TransactionPinDto } from '../../../shared/dto/transaction-pin.dto';
import { Helper } from '../../../shared/helpers';
import { TaskTypes } from '../enums/task-types.enum';

export class CreateTaskDto extends TransactionPinDto {
  @ApiProperty({ example: Helper.faker.lorem.word() })
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: Helper.faker.lorem.paragraph() })
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: Helper.faker.datatype.number({ min: 150, max: 1000 }),
  })
  @IsNotEmpty()
  rewardFee: number;

  @ApiProperty({
    enum: TaskTypes,
  })
  @IsEnum(TaskTypes)
  @IsNotEmpty()
  type: string;

  // @ApiProperty({ enum: TaskRewardCycle })
  // @IsNotEmpty()
  // @IsEnum(TaskRewardCycle)
  // rewardCycle: string;

  @ApiProperty({ example: Helper.faker.datatype.number({ min: 1, max: 15 }) })
  @IsNotEmpty()
  duration: number;

  @ApiProperty({ example: Helper.faker.datatype.uuid() })
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: Helper.faker.datatype.number({ min: 10, max: 20 }) })
  @IsOptional()
  @IsOdd({ message: 'maxParticipants must be an odd number' })
  maxParticipants: number;

  @ApiHideProperty()
  createdById: string;
}
