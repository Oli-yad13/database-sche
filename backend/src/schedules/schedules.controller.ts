import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Patch,
    UseGuards,
    ParseIntPipe,
    Query,
} from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Role } from '@prisma/client';

@Controller('schedules')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SchedulesController {
    constructor(private readonly schedulesService: SchedulesService) { }

    @Public()
    @Get()
    findAll(
        @Query('sectionId') sectionId?: string,
        @Query('courseId') courseId?: string,
        @Query('teacherId') teacherId?: string,
        @Query('roomId') roomId?: string,
    ) {
        return this.schedulesService.findAll({
            sectionId: sectionId ? parseInt(sectionId) : undefined,
            courseId: courseId ? parseInt(courseId) : undefined,
            teacherId: teacherId ? parseInt(teacherId) : undefined,
            roomId: roomId ? parseInt(roomId) : undefined,
        });
    }

    @Public()
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.schedulesService.findOne(id);
    }

    @Post()
    @Roles(Role.admin)
    create(
        @Body()
        createScheduleDto: {
            sectionId: number;
            courseId: number;
            teacherId?: number;
            roomId: number;
            timeSlotId: number;
            semesterId?: number;
        },
    ) {
        return this.schedulesService.create(createScheduleDto);
    }

    @Patch(':id')
    @Roles(Role.admin)
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body()
        updateScheduleDto: {
            sectionId?: number;
            courseId?: number;
            teacherId?: number;
            roomId?: number;
            timeSlotId?: number;
            semesterId?: number;
        },
    ) {
        return this.schedulesService.update(id, updateScheduleDto);
    }

    @Delete(':id')
    @Roles(Role.admin)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.schedulesService.remove(id);
    }

    @Post('validate')
    @Roles(Role.admin)
    validateAssignment(
        @Body()
        data: {
            sectionId: number;
            roomId: number;
            timeSlotId: number;
        },
    ) {
        return this.schedulesService.validateAssignment(data);
    }

    @Post('check-conflicts')
    @Roles(Role.admin)
    checkConflicts(
        @Body()
        data: {
            sectionId?: number;
            courseId?: number;
            roomId: number;
            timeSlotId: number;
        },
    ) {
        return this.schedulesService.checkConflicts(data);
    }
}
