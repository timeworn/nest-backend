import { Module } from '@nestjs/common';
import { Thresh0ldAddressService } from './thresh0ld-address.service';
import { Thresh0ldService } from './thresh0ld.service';

@Module({
  providers: [Thresh0ldService, Thresh0ldAddressService],
  exports: [Thresh0ldService, Thresh0ldAddressService],
})
export class Thresh0ldModule {}
