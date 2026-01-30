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
import { SectionsService } from './sections.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';

@Controller('sections')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Public()
  @Get()
  async findAll(
    @Query('departmentId') departmentId?: string,
    @Query('yearLevel') yearLevel?: string,
  ) {
    return this.sectionsService.findAll(
      departmentId ? parseInt(departmentId) : undefined,
      yearLevel ? parseInt(yearLevel) : undefined,
    );
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sectionsService.findOne(id);
  }

  @Post()
  @Roles('admin')
  async create(@Body() data: any) {
    return this.sectionsService.create(data);
  }

  @Put(':id')
  @Roles('admin')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: any,
  ) {
    return this.sectionsService.update(id, data);
  }

  @Delete(':id')
  @Roles('admin')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.sectionsService.delete(id);
  }
}
