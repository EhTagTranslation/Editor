import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InjectableBase } from '../injectable-base.js';
import { NamespaceName } from '#shared/interfaces/ehtag.js';
import { DatabaseService } from './database.service.js';
import { NsParams } from './params.dto.js';
import { Badge } from './database-badge.dto.js';

@Controller('database')
@ApiTags('Badge')
export class DatabaseBadgeController extends InjectableBase {
    constructor(private readonly service: DatabaseService) {
        super();
    }

    private makeBadge(label: string, message: string, error = false): Badge {
        if (!label) {
            error = true;
            label = 'no-label';
        }
        if (!message) {
            error = true;
            message = 'no-message';
        }
        return {
            schemaVersion: 1,
            label,
            message,
            isError: error,
        };
    }

    @Get('~badge')
    async getBadge(): Promise<Badge> {
        const sha = await this.service.data.sha();
        return this.makeBadge('database', sha.slice(0, 8));
    }

    @Get('all/~badge')
    getBadgeAll(): Badge {
        const size = NamespaceName.reduce((sum, namespace) => sum + this.service.data.data[namespace].size, 0);
        return this.makeBadge('all records', size.toString());
    }

    @Get(':namespace/~badge')
    getBadgeNs(@Param() p: NsParams): Badge {
        return this.makeBadge(p.namespace, this.service.data.data[p.namespace].size.toString());
    }
}
