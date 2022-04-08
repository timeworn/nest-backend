import { Transform } from 'class-transformer';
import { IsNotEmpty, Matches, MinLength } from 'class-validator';
import { MustMatch } from '../../../shared/decorators/regex.decorator';

export class CheckUsernameDto {
  @Transform(({ value }) => value.toLowerCase())
  @IsNotEmpty()
  @MinLength(4)
  @MustMatch(`^(?=.*\\w)[\\w]{4,15}$`)
  // @Matches(`^(?=.*\\w)[\\w]{4,15}$`)
  username: string;
}
