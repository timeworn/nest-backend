import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getRepository, Repository } from 'typeorm';
import { AbstractPaginationDto } from '../../shared/dto/abstract-pagination.dto';
import { Helper } from '../../shared/helpers';
import { AbstractService } from '../../shared/services/abstract-service.service';
import { Order } from '../orders/entities/order.entity';
import { Product } from '../products/entities/product.entity';
import { Review } from '../reviews/entities/review.entity';
import { RolesService } from '../roles/roles.service';
import { AssignRoleDto } from './dto/assign-role.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UserFilterDto } from './dto/filter.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService extends AbstractService<User> {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>, // private jwtService: JwtService,
    private readonly rolesService: RolesService,
  ) {
    super();
    this.repository = this.userRepo;
    this.modelName = 'User';
  }

  async create(createUserDto: CreateUserDto) {
    try {
      const { firstName, lastName, email, telephone } = createUserDto;
      const password = this.randPassword(6, 3, 2);
      const payload = {
        firstName,
        lastName,
        email,
        telephone,
        password,
      };
      const response = this.userRepo.create(payload);
      console.log('password is ', password);
      const user = await this.userRepo.save(response);
      return user;
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Email has already been taken');
      }
      throw error;
    }
  }

  private randPassword(letters: number, numbers: number, either: number) {
    const chars = [
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', // letters
      '0123456789', // numbers
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', // either
    ];

    return [letters, numbers, either]
      .map(function (len, i) {
        return Array(len)
          .fill(chars[i])
          .map(function (x) {
            return x[Math.floor(Math.random() * x.length)];
          })
          .join('');
      })
      .concat()
      .join('')
      .split('')
      .sort(function () {
        return 0.5 - Math.random();
      })
      .join('');
  }

  async assignRole(assignRoleDto: AssignRoleDto) {
    const { userId, roleId } = assignRoleDto;
    const user = await this.findOne(userId);
    const role = await this.rolesService.findOne(roleId);
    user.role = role;
    await user.save();
    return user;
  }

  async checkUsername(username: string) {
    const user = await this.userRepo.findOne({
      where: { username: username.toLowerCase() },
    });
    if (user) throw new ConflictException('Username exists');
    return {
      username,
    };
  }

  findByUsername(username: string) {
    const query = this.userRepo.createQueryBuilder('root');

    query.where('root.username LIKE :username', { username: `%${username}%` });

    return query.getMany();
  }

  findAllUsers(pagination: AbstractPaginationDto, filter: UserFilterDto) {
    const query = this.userRepo.createQueryBuilder('root');
    query.leftJoinAndSelect('root.role', 'role');

    if (filter.role) {
      query.where('role.slug LIKE :role', { role: `%${filter.role}%` });
    }

    return Helper.paginateItems(query, pagination);
  }

  async fetchVendorStats(user: User) {
    const orders = await getRepository(Order).find({ where: { vendorId: user.id, status: 'Completed' } });
    const query = getRepository(Review).createQueryBuilder('root');
    query.leftJoinAndSelect('root.product', 'product');
    query.where('product.userId = :userId', { userId: user.id });
    const reviews = await query.getMany();

    const ratings = reviews.map((z) => z.rating);
    const rating = (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1);

    const itemsSold = orders.map((item) => item.quantity);

    const noItemsSold = itemsSold.reduce((a, b) => a + b, 0);

    return { noItemsSold, noPeopleRated: reviews.length, rating };
  }

  async fetchUserProfile(id: string) {
    const user = await super.findOne(id);

    const vendorStats = await this.fetchVendorStats(user);

    const products = await getRepository(Product).find({ where: { userId: user.id, published: true }, take: 5 });

    return {
      ...user.toJSON(),
      vendorStats,
      products,
    };
  }
}
