import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    UseGuards,
    ParseIntPipe,
    Patch,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Role } from '@prisma/client';

@Controller('events')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventsController {
    constructor(private readonly eventsService: EventsService) { }

    @Public()
    @Get()
    findAll() {
        return this.eventsService.findAll();
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.admin)
    create(
        @Body()
        createEventDto: {
            title: string;
            description?: string;
            eventType: string;
            startDate: string;
            endDate: string;
            isAllDay?: boolean;
            affectsSchedule?: boolean;
        },
    ) {
        return this.eventsService.create(createEventDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.admin)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.eventsService.remove(id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.admin)
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body()
        updateEventDto: {
            title?: string;
            description?: string;
            eventType?: string;
            startDate?: string;
            endDate?: string;
            isAllDay?: boolean;
            affectsSchedule?: boolean;
        },
    ) {
        return this.eventsService.update(id, updateEventDto);
    }
}
