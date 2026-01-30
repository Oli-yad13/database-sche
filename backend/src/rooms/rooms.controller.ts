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
import { RoomsService } from './rooms.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';

@Controller('rooms')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Public()
  @Get()
  async findAll(
    @Query('building') building?: string,
    @Query('type') type?: string,
  ) {
    return this.roomsService.findAll(building, type);
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.roomsService.findOne(id);
  }

  @Post()
  @Roles('admin')
  async create(@Body() data: any) {
    return this.roomsService.create(data);
  }

  @Put(':id')
  @Roles('admin')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: any,
  ) {
    return this.roomsService.update(id, data);
  }

  @Delete(':id')
  @Roles('admin')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.roomsService.delete(id);
  }
}
