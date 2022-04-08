import { ApiProperty } from '@nestjs/swagger';
import { AfterLoad, Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { AbstractEntity } from '../../../shared/entities/abstract-entity';
import { Helper } from '../../../shared/helpers';
import { Product } from '../../products/entities/product.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { User } from '../../users/entities/user.entity';
import { TaskStatus } from '../enums/task-status.enum';
import { TaskParticipant } from './task-participant.entity';

@Entity('tasks')
export class Task extends AbstractEntity {
  @ApiProperty({ example: Helper.faker.lorem.word() })
  @Column()
  title: string;

  @ApiProperty({ example: Helper.faker.lorem.paragraph() })
  @Column('text')
  description: string;

  @ApiProperty({
    example: Helper.faker.datatype.number({ min: 150, max: 1000 }),
  })
  @Column('float')
  rewardFee: number;

  @ApiProperty({
    example: 'NGN',
  })
  @Column({ default: 'NGN' })
  currency: string;

  @Column({ default: 'basic' })
  type: string;

  @ApiProperty({ example: Helper.faker.datatype.number({ min: 2, max: 15 }) })
  @Column()
  duration: number;

  @ApiProperty({ example: Helper.faker.datatype.number({ min: 10, max: 50 }) })
  @Column()
  maxParticipants: number;

  @ApiProperty({ example: TaskStatus.PENDING })
  @Column({ default: TaskStatus.PENDING })
  status: string;

  @ApiProperty({ example: false })
  @Column({ default: false })
  approved: boolean;

  @ApiProperty({ example: false })
  @Column({ default: false })
  completed: boolean;

  @ApiProperty({ type: [TaskParticipant] })
  @OneToMany(() => TaskParticipant, (participants) => participants.task, {
    eager: true,
  })
  participants: TaskParticipant[];

  @ApiProperty({ type: User })
  @ManyToOne(() => User)
  @JoinColumn()
  createdBy: User;

  @Column()
  createdById: string;

  @ApiProperty({ type: Product })
  @ManyToOne(() => Product, { eager: true })
  @JoinColumn()
  product: Product;

  @Column()
  productId: string;

  @ManyToOne(() => Transaction)
  @JoinColumn()
  transaction: Transaction;

  @Column()
  transactionId: string;

  @Column({ nullable: true })
  acceptedAnswer: string;

  protected expiryDate: any;
  protected slotsLeft: number;
  protected isParticipant: number;
  public hasExpired: boolean = false;

  @AfterLoad()
  handleAfterLoad() {
    this.expiryDate = Helper.dayjs(this.createdAt).add(this.duration, 'day');
    this.slotsLeft = this.maxParticipants - this.participants.length;
    this.hasExpired = this.expiryDate.isBefore(Helper.dayjs());
    // this.isParticipant = this.participants.find((x)=>x.userId)
  }
}
