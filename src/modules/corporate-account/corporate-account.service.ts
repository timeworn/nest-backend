import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Helper } from '../../shared/helpers';
import { AbstractService } from '../../shared/services/abstract-service.service';
import { User } from '../users/entities/user.entity';
import { CreateCorporateAccountDto, CreateMemberDto, MemberStatus, MemberType } from './dto/create-corporate-account.dto';
import { UpdateCorporateAccountDto } from './dto/update-corporate-account.dto';
import { CorporateAccountMember } from './entities/corporate-account-member.entity';
import { CorporateAccount } from './entities/corporate-account.entity';
import getBaseUrl from 'get-base-url';
import { CustomLink } from '../users/dto/membership-link.dto';
import { UsersService } from '../users/users.service';
import { RequestMembershipService } from '../request-membership/request-membership.service';

@Injectable()
export class CorporateAccountService extends AbstractService<CorporateAccountMember> {
  constructor(
    @InjectRepository(CorporateAccountMember) private readonly corporateAccountMemberRepo: Repository<CorporateAccountMember>,
    private readonly userService: UsersService,
    private readonly requestMembershipService: RequestMembershipService,
  ) {
    super();
    this.repository = this.corporateAccountMemberRepo;
    this.modelName = 'CorporateAccount';
  }

  async getLink(corporateUser: User) {
    const { membershipLink } = corporateUser;
    if (membershipLink && membershipLink !== '') {
      const link = `${getBaseUrl()}${membershipLink}`;
      return { membershipLink: link };
    }
    return this.generateLink(corporateUser);
  }

  async generateLink(corporateUser: User) {
    const linkString = Helper.generateString(22);
    const checkUniqueness = await this.userService.findOne(linkString, 'membershipLink');
    if (checkUniqueness) {
      return this.generateLink(corporateUser);
    }
    corporateUser.membershipLink = linkString;
    await this.userService.update(corporateUser.id, corporateUser);
    const link = `${getBaseUrl()}${corporateUser.membershipLink}`;
    return { membershipLink: link };
  }

  async generateUserLink(userId: string, corporateUser: User) {
    const linkString = Helper.generateString(22);
    const user: User = await this.userService.findOne(userId).catch((e) => {
      throw new BadRequestException('Invalid user');
    });

    const link: CustomLink = {
      link: `${getBaseUrl()}${linkString}`,
      userId: userId,
    };

    // Check if link exsists and replacemen
    let linkExists = corporateUser.customMembershipLinks.find((linkObj) => linkObj.userId == userId);
    if (linkExists) {
      // Remove previous.
      corporateUser.customMembershipLinks = corporateUser.customMembershipLinks.filter((linkObj) => linkObj.userId != linkExists.userId);
    }
    corporateUser.customMembershipLinks.push(link);
    await corporateUser.save();
    // await this.mailerService
    //   .sendMail({
    //     to: user.email, // list of receivers
    //     subject: 'New Request Notification', // Subject line
    //     template: 'request-link', // HTML body content
    //     context: {
    //       firstname: user.firstName,
    //       lastname: user.lastName,
    //       username: user.username,
    //     },
    //   })
    //   .then(() => {})
    //   .catch((e) => {
    //     console.log({ error: e });
    //   });
    return link;
  }

  async joinViaLink(link: string, user: User) {
    // Check if corporate user exsists
    const linkArr = link.split('/');
    const corporate = await this.findOne(linkArr[linkArr.length - 1], 'membershipLink');
    if (!corporate) {
      throw new BadRequestException('Invalid link');
    }

    // Check if user is already a member
    const check = await this.findOne(user.id, 'memberId');
    if (!check) {
      throw new BadRequestException('You are already a member');
    }

    const payload: CreateMemberDto = {
      corporateAccountId: corporate.id,
      memberId: user.id,
      status: MemberStatus.ACTIVE,
      type: MemberType.DISTRIBUTOR,
    };
    return await this.create(payload);
  }

  async createRequestViaLink(link: string, user: User) {
    // Check if corporate user exsists
    const linkArr = link.split('/');
    const corporate = await this.findOne(linkArr[linkArr.length - 1], 'membershipLink');
    if (!corporate) {
      throw new BadRequestException('Invalid link');
    }

    // Check if user is already a member
    const check = await this.findOne(user.id, 'memberId');
    if (!check) {
      throw new BadRequestException('You are already a member');
    }

    // Create request
    const payload: CreateMemberDto = {
      corporateAccountId: corporate.id,
      memberId: user.id,
      status: MemberStatus.PENDING,
      type: MemberType.DISTRIBUTOR,
    };

    return await this.requestMembershipService.create(payload);
  }
}
