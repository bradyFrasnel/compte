import { IsString, IsNotEmpty, MinLength, MaxLength, Matches } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{6}$/, { message: 'Le token doit être composé de 6 chiffres' })
  token: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}
