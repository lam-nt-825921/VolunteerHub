import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AllowGuest } from '../common/decorators/allow-guest.decorator';
import { EventsService, EventActor } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { FilterEventsDto } from './dto/filter-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { UpdateEventStatusDto } from './dto/update-status.dto';

type RequestWithUser = Request & { user?: EventActor };

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @AllowGuest()
  @Get('public')
  getPublicEvents(@Query() filterDto: FilterEventsDto) {
    return this.eventsService.getPublicEvents(filterDto);
  }

  @Get()
  findAll(@Req() req: RequestWithUser, @Query() filterDto: FilterEventsDto) {
    const actor = this.getActor(req);
    return this.eventsService.findAll(filterDto, actor);
  }

  @AllowGuest()
  @Get(':id')
  findOne(
    @Req() req: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.eventsService.findOne(id, req.user);
  }

  @Post()
  create(@Req() req: RequestWithUser, @Body() dto: CreateEventDto) {
    const actor = this.getActor(req);
    return this.eventsService.create(dto, actor);
  }

  @Patch(':id')
  update(
    @Req() req: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEventDto,
  ) {
    const actor = this.getActor(req);
    return this.eventsService.update(id, dto, actor);
  }

  @Patch(':id/status')
  updateStatus(
    @Req() req: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEventStatusDto,
  ) {
    const actor = this.getActor(req);
    return this.eventsService.updateStatus(id, dto, actor);
  }

  private getActor(req: RequestWithUser): EventActor {
    if (!req.user) {
      throw new UnauthorizedException('Bạn cần đăng nhập để tiếp tục');
    }
    return req.user;
  }
}

