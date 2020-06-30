import { Controller, Get, Param } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { InjectableBase } from 'server/injectable-base';
import { NamespaceName } from 'shared/interfaces/ehtag';
import { NsParams } from './params.dto';
import { Badge } from './database-badge.dto';

@Controller('database/~badge')
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

    @Get()
    async getBadge(): Promise<Badge> {
        const sha = await this.service.data.sha();
        return this.makeBadge('database', sha.slice(0, 8));
    }

    @Get('all')
    getBadgeAll(): Badge {
        const size = NamespaceName.reduce((sum, namespace) => sum + this.service.data.data[namespace].size, 0);
        return this.makeBadge('all records', size.toString());
    }

    @Get(':namespace')
    getBadgeNs(@Param() p: NsParams): Badge {
        return this.makeBadge(p.namespace, this.service.data.data[p.namespace].size.toString());
    }
}
