import { IsString } from 'class-validator';

export class JoinByInviteCodeDto {
  @IsString()
  inviteCode: string;
}


