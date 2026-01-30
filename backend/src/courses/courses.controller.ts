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
import { CoursesService } from './courses.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';

@Controller('courses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Public()
  @Get()
  async findAll(
    @Query('departmentId') departmentId?: string,
    @Query('level') level?: string,
  ) {
    return this.coursesService.findAll(
      departmentId ? parseInt(departmentId) : undefined,
      level ? parseInt(level) : undefined,
    );
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.coursesService.findOne(id);
  }

  @Post()
  @Roles('admin')
  async create(@Body() data: any) {
    return this.coursesService.create(data);
  }

  @Put(':id')
  @Roles('admin')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: any,
  ) {
    return this.coursesService.update(id, data);
  }

  @Delete(':id')
  @Roles('admin')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.coursesService.delete(id);
  }
}
