import { Controller } from '@nestjs/common';
import { InjectableBase } from 'server/injectable-base';
import { DatabaseService } from './database.service';

@Controller('database')
export class DatabaseController extends InjectableBase {
    constructor(private readonly service: DatabaseService) {
        super();
    }
}
