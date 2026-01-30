import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { TimeslotsService } from './timeslots.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';

@Controller('timeslots')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TimeslotsController {
  constructor(private readonly timeslotsService: TimeslotsService) {}

  @Public()
  @Get()
  async findAll(@Query('day') day?: string) {
    return this.timeslotsService.findAll(day);
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.timeslotsService.findOne(id);
  }

  @Post()
  @Roles('admin')
  async create(@Body() data: any) {
    return this.timeslotsService.create(data);
  }

  @Put(':id')
  @Roles('admin')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: any,
  ) {
    return this.timeslotsService.update(id, data);
  }

  @Delete(':id')
  @Roles('admin')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.timeslotsService.delete(id);
  }
}
