import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class JoinByInviteCodeDto {
  @ApiProperty({
    example: 'abc123xyz456',
    description: 'Mã mời tham gia sự kiện PRIVATE',
  })
  @IsString()
  inviteCode: string;
}


