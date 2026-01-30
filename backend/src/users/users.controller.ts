
import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseGuards,
    ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    @Roles(Role.admin)
    findAll(
        @Query('search') search?: string,
        @Query('role') role?: Role,
    ) {
        return this.usersService.findAll(search, role);
    }

    @Get(':id')
    @Roles(Role.admin)
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.findOne(id);
    }

    @Post()
    @Roles(Role.admin)
    create(@Body() data: {
        username: string;
        email: string;
        password?: string;
        role: Role;
        isActive?: boolean;
        isVerified?: boolean;
    }) {
        return this.usersService.create(data);
    }

    @Patch(':id')
    @Roles(Role.admin)
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() data: {
            username?: string;
            email?: string;
            password?: string;
            role?: Role;
            isActive?: boolean;
            isVerified?: boolean;
        },
    ) {
        return this.usersService.update(id, data);
    }

    @Delete(':id')
    @Roles(Role.admin)
    delete(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.delete(id);
    }
}
