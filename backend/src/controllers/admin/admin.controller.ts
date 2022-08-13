import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
} from '@nestjs/common';
import { AdminOnly, JwtGuard } from 'src/decorators/custom.decorator';
import { AdminService } from './admin.service';

@Controller('admin')
@JwtGuard()
@AdminOnly()
export class AdminController {
    constructor(private readonly adminService: AdminService) {}
}
