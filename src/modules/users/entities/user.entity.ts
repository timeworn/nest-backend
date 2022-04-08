import { AfterLoad, BeforeInsert, Column, Entity, getRepository, JoinColumn, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
import { Role } from '../../roles/entities/role.entity';
import { classToPlain, Exclude } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { AbstractEntity } from '../../../shared/entities/abstract-entity';
import { AccountStatus } from '../enums/account-status.enum';
import { OneToOne } from 'typeorm';
import { Setting } from '../../settings/entities/setting.entity';
import { SmartSearch } from '../../smart-search/entities/smart-search.entity';
import { Product } from '../../products/entities/product.entity';
import { CustomLink } from '../dto/membership-link.dto';

@Entity('users')
export class User extends AbstractEntity {
  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true, nullable: true })
  username: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ unique: true })
  email: string;

  @Column('text', { nullable: true })
  bio: string;

  @Column({ nullable: true })
  countryCode: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  dialCode: string;

  @Column({ nullable: true, unique: true })
  phoneNumber: string;

  @Exclude()
  @Column()
  password: string;

  @ManyToOne(() => Role, (role) => role.users, { eager: true })
  @JoinColumn()
  role: Role;

  @Column({ nullable: true })
  roleId: string;

  @Column({ nullable: true })
  membershipLink: string;

  @Column('jsonb', { nullable: true })
  customMembershipLinks: CustomLink[];

  @OneToOne(() => Setting, (setting) => setting.user, { eager: true })
  @JoinColumn()
  setting: Setting;

  @Column({ nullable: true })
  settingId: string;

  @Column({ default: false })
  verified: boolean;

  @Column('text', { default: '' })
  fcmToken: string;

  @Column({ default: AccountStatus.ACTIVE })
  status: AccountStatus;

  @Column({ nullable: true })
  referralCode: string;

  @Column({ nullable: true })
  referredByCode: string;

  protected products: Product[] = [];

  public fullName: string;

  public fullPhoneNumber: string;

  @BeforeInsert()
  async handleBeforeInsert() {
    this.password = await bcrypt.hashSync(this.password, 8);
  }

  @AfterLoad()
  async handleAfterLoad() {
    this.fullName = this.firstName + ' ' + this.lastName;
    this.fullPhoneNumber = `${this.dialCode}${this.phoneNumber}`;
    // const products = await getRepository(Product).find({ where: { userId: this.id, published: true }, take: 5 });
    // this.products = products;
  }

  async comparePassword(password: string) {
    return await bcrypt.compare(password, this.password);
  }

  toJSON() {
    return classToPlain(this);
  }
}
