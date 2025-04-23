import { listGalleries } from '#shared/ehentai/index';
import { program } from '@commander-js/extra-typings';

const gallery = program.command('gallery').description('获取画廊信息');
gallery
    .command('get')
    .description('获取画廊信息')
    .argument('id', '画廊 ID', (s) => Number.parseInt(s))
    .argument('token', '画廊 Token')
    .action(async (id: number, token: string) => {
        const [result] = await listGalleries([[id, token]]);
        if (result) {
            console.log(result);
        } else {
            console.error('获取画廊信息失败');
        }
    });
