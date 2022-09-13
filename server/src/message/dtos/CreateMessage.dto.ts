import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { User } from 'src/typeorm';

export class CreateMessageDto {
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsBoolean()
  seen: boolean;
}
