import { listGalleries } from '#shared/ehentai/index';
import type { GalleryId } from '#shared/ehentai/list-galleries';
import { program, InvalidArgumentError } from '@commander-js/extra-typings';

const gallery = program.command('gallery').description('获取画廊信息');
gallery
    .command('get')
    .description('获取画廊信息')
    .argument('<id/token...>', '画廊 ID/画廊 Token', (value, list: GalleryId[]) => {
        const [idStr, token] = value.split('/');
        const id = parseInt(idStr, 10);
        if (!id || !token) {
            throw new InvalidArgumentError('请提供画廊 ID 和 Token，格式为 ID/Token');
        }
        if (!Array.isArray(list)) return [[id, token]] satisfies GalleryId[];
        return [...list, [id, token]] satisfies GalleryId[];
    })
    .action(async (ids) => {
        const result = await listGalleries(ids);
        if (result) {
            console.log(result);
        } else {
            console.error('获取画廊信息失败');
            process.exitCode = 2;
        }
    });
