import { Injectable, Logger } from '@nestjs/common';

/** Injectable 类型的基类，包含一些常用的注入内容 */
@Injectable()
class InjectableBase {
    constructor() {
        this.logger = new Logger(new.target.name, { timestamp: true });
        this.logger.log(`Constructing ${new.target.name}`);
    }
    /** 日志服务 */
    protected readonly logger: Logger;
}

export { InjectableBase };
