import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MessagesService } from './messages.service';
import { MessageJobDto } from './dto';

@Controller('messages')
@UseGuards(AuthGuard('jwt'))
export class MessagesController {
  constructor(private readonly messageService: MessagesService) {}

  @Post()
  sendMessage(@Body() data: MessageJobDto) {
    void this.messageService.sendMessageJobApproveReq(data);

    return 'success';
  }
}
