import { Exclude } from 'class-transformer';
import { Entity, JoinColumn, JoinTable, OneToOne } from 'typeorm';
import { Column, ManyToMany } from 'typeorm';
import { AbstractEntity } from '../../../shared/entities/abstract-entity';
import { Category } from '../../categories/entities/category.entity';
import { Interest } from '../../interests/entities/interest.entity';
import { User } from '../../users/entities/user.entity';

@Entity('settings')
export class Setting extends AbstractEntity {
  @OneToOne(() => User, (user) => user.setting)
  user: User;

  @Column()
  userId: string;

  @Column({ default: 'NGN' })
  currency: string;

  @Column({ default: true })
  pushNotifications: boolean;

  @Column({ default: true })
  emailNotifications: boolean;

  @Column({ default: true })
  sounds: boolean;

  @ManyToMany(() => Interest, (interests) => interests.settings, {
    eager: true,
  })
  @JoinTable()
  interests: Interest[];

  @ManyToMany(() => Category, (category) => category.settings, { eager: true })
  @JoinTable()
  subscribedCategories: Category[];

  @Column({ default: false })
  hideAmount: boolean;

  @Exclude()
  @Column({ default: null })
  transactionPin: string;

  @Column({ default: true })
  allowBiometrics: boolean;
}
