import { IsNotEmpty, IsString } from 'class-validator';

export class SendRequestDto {
  @IsNotEmpty()
  receiver: string;

  @IsString()
  receiverImage: string;

  @IsNotEmpty()
  receiverId: number;
}
