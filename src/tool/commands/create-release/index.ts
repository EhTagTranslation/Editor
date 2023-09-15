import path from 'node:path';
import { program } from 'commander';
import { parseNamespace } from '#shared/namespace';
import { Database } from '#shared/database';
import { NamespaceName } from '#shared/interfaces/ehtag';
import { action } from '../../utils.js';
import { FileLogger } from './file-logger';
import { ActionLogger } from './action-logger';
import { runSourceCheck } from './source-check';
import { createRelease } from './create-release';

program
    .command('create-release')
    .description('生成发布文件')
    .argument('[source]', 'REPO 的本地路径')
    .argument('[destination]', '生成发布文件的路径')
    .option('--strict', '启用严格检查')
    .option('--source-check [ns]', '检查 E 站标签数据库，提示不存在的和重命名的标签')
    .option('--no-search', '不使用标签建议和搜索对 E 站标签数据库进行检查')
    .option('--no-rewrite', '不重新序列化数据库内容')
    .action(
        async (
            source: string | undefined,
            destination: string | undefined,
            options: {
                strict: boolean;
                rewrite: boolean;
                sourceCheck: string | boolean;
                search: boolean;
            },
        ) => {
            source = path.resolve(source ?? '.');
            destination = path.resolve(destination ?? path.join(source, 'publish'));
            const { strict, rewrite, sourceCheck, search } = options;
            const db = await Database.create(
                source,
                undefined,
                action.isAction() ? new ActionLogger(strict ? 'warn' : 'error') : new FileLogger(source),
            );
            if (sourceCheck || typeof sourceCheck == 'string') {
                const checkNs: NamespaceName[] = [];
                if (sourceCheck && typeof sourceCheck == 'string') {
                    for (const ns of sourceCheck.split(/[,;:\s]/)) {
                        if (!ns) continue;
                        const nsName = parseNamespace(ns);
                        if (!nsName) {
                            console.error(`无效的命名空间 ${ns}`);
                            process.exitCode = 2;
                            return;
                        }
                        checkNs.push(nsName);
                    }
                    console.log(`检查命名空间 ${checkNs.join(', ')}`);
                } else {
                    checkNs.push(...NamespaceName);
                }
                await runSourceCheck(db, {
                    checkedNs: checkNs,
                    useSearch: search,
                });
            }
            await createRelease(db, destination);
            if (rewrite) {
                await db.save();
            }
        },
    );
