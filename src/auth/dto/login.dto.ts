import { IsString, IsNotEmpty, MinLength, IsEmail } from 'class-validator';
import { Transform } from 'class-transformer';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  identifier: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
