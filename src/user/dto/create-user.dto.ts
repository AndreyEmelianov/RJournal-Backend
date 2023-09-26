import { IsEmail } from 'class-validator';

export class CreateUserDto {
  fullName: string;

  @IsEmail(undefined, { message: 'Неверная почта' })
  email: string;

  password?: string;
}
