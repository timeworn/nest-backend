import { CorporateAccountMember } from './../corporate-account/entities/corporate-account-member.entity';
import { MemberType, MemberStatus } from './../corporate-account/dto/create-corporate-account.dto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getRepository } from 'typeorm';
import { AbstractService } from '../../shared/services/abstract-service.service';
import { CreateMemberDto } from '../corporate-account/dto/create-corporate-account.dto';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { CreateMembershipRequestDto } from './dto/create-request.dto';
import { RequestMembership } from './entity/request-membership.entity';

@Injectable()
export class RequestMembershipService extends AbstractService<RequestMembership> {
  constructor(
    @InjectRepository(RequestMembership) private readonly requestMembershipRepo: Repository<RequestMembership>, // private readonly membersService: CorporateAccountService,
  ) {
    super();
    this.repository = this.requestMembershipRepo;
    this.modelName = 'RequestMembership';
  }

  async requestMembership(createMembershipRequestDto: CreateMembershipRequestDto, user: User) {
    const { corporateId, type } = createMembershipRequestDto;
    const validCooperate = await getRepository(User).findOne({
      id: corporateId,
      roleId: 'e10ecc87-64e5-4b40-9f10-69e0dfa94a8a',
    });
    if (!validCooperate) {
      throw new BadRequestException('Invalid corporate account');
    }

    const checkExsistence = await this.requestMembershipRepo.findOne({
      userId: user.id,
      corporateAccountId: validCooperate.id,
    });
    if (checkExsistence) {
      if (checkExsistence.status) throw new BadRequestException('You are already a member');
      throw new BadRequestException('Your request is under review');
    }

    const request = await this.create({
      userId: user.id,
      corporateAccountId: validCooperate.id,
      type: type,
      status: MemberStatus.PENDING,
    });
    return request;
  }

  async acceptMembership(id: string) {
    const request = await this.findOne(id);
    request.status = true;
    const updatedRequest = await this.update(id, request);
    const payload: CreateMemberDto = {
      corporateAccountId: updatedRequest.corporateAccountId,
      memberId: updatedRequest.userId,
      status: MemberStatus.ACTIVE,
      type: MemberType.DISTRIBUTOR,
    };
    const response = getRepository(CorporateAccountMember).create(payload);
    await response.save();
    return response;
  }

  async declineMembership(id: string) {
    const request = await this.findOne(id);
    const payload: CreateMemberDto = {
      corporateAccountId: request.corporateAccountId,
      memberId: request.userId,
      status: MemberStatus.DECLIENED,
      type: MemberType.DISTRIBUTOR,
    };
    await getRepository(CorporateAccountMember).create(payload).save();

    return await this.remove(id);
  }
}
