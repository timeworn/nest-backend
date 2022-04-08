import { Point } from 'geojson';
import { AfterLoad, BeforeInsert, Column, Entity, Index } from 'typeorm';
import { BasicEntity } from '../../../shared/entities/basic-entity';
import { Helper } from '../../../shared/helpers';
import { ReferralTaskCapType } from '../enums/referral-task-cap-type.enum';
import { ReferralTaskCancelledAction, ReferralTaskStatus } from '../enums/referral-task-status.enum';

@Entity('referral-tasks')
export class ReferralTask extends BasicEntity {
  @Column() referralId: string;

  @Column() currency: string;

  @Column('float') amount: number;

  @Column('enum', { enum: ReferralTaskCapType }) capType: string;

  @Column() cap: number;

  @Column() refferedByPercentage: number;

  @Column() startDate: Date;

  @Column() endDate: Date;

  @Column() country: string;

  @Index({ spatial: true })
  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  location: Point;

  @Column({ default: false }) shareholder: boolean;

  @Column('jsonb', { default: [] }) levels: { range: { min: number; max: number }; percentage: number }[];

  @Column('enum', { enum: ReferralTaskStatus, default: ReferralTaskStatus.Pending }) status: string;

  @Column('text', { nullable: true }) cancelledReason: string;

  @Column('enum', { enum: ReferralTaskCancelledAction, nullable: true }) cancelledAction: ReferralTaskCancelledAction;

  public hasExpired: boolean = false;
  public canWithdraw: boolean = false;

  @BeforeInsert()
  handleBeforeInsert() {
    this.referralId = Helper.encodeId('spottr_ref', Helper.faker.datatype.uuid());
  }

  @AfterLoad()
  handleAfterLoad() {
    // const startDate = Helper.dayjs(this.startDate);
    const endDate = Helper.dayjs(this.endDate);

    const endOfMonth = Helper.dayjs().endOf('month').format('LL');
    const today = Helper.dayjs().format('LL');

    this.canWithdraw = Helper.dayjs(endOfMonth).isSame(Helper.dayjs(today));

    this.hasExpired = endDate.isBefore(Helper.dayjs());
  }
}
