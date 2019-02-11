import { DataSource } from '@angular/cdk/collections';
import { MatPaginator, MatSort } from '@angular/material';
import { map } from 'rxjs/operators';
import { Observable, of as observableOf, merge } from 'rxjs';

// TODO: Replace this with your own data model type
export interface ListItem {
  Raw: string;
  Name: string;
  Describe: string;
  externalLinks?: string;
}

// TODO: replace this with real data from your application
const EXAMPLE_DATA: ListItem[] = [
  {
    Raw: 'pop',
    Name: 'POP',
    Describe: '![POP](http://ww4.sinaimg.cn/large/6c84b2d6gw1f3tw194prdj205k05kaaf.jpg)\n萌单作者\n![萌单](http://ww2.sinaimg.cn/large/6c84b2d6gw1f3614z9jokj205k07ndg1.jpg)',

  }, {
    Raw: 'oouso',
    Name: '大嘘',
    Describe: '![大嘘头像](http://ww1.sinaimg.cn/large/6c84b2d6gy1fjkes482gzj204q04qmxx.jpg)\n袜控，尻控，女子高中生(误)画家。\n![大嘘作品](http://ul.ehgt.org/72/3c/723ca0e20e7cbf1b9f83c3a082c37b560de437aa-2602261-1787-2500-jpg_250.jpg)',
    externalLinks: '[pixiv](https://www.pixiv.net/member.php?id=457541)'
  }, {
    Raw: 'peko',
    Name: 'ぺこ',
    Describe: '![peko头像](http://ww3.sinaimg.cn/large/6c84b2d6gw1f35z6x8izpj204q04qq34.jpg)\n亲吻那朵花百合系列作者\n![peko作品](http://ul.ehgt.org/50/59/5059df7b65603a3224d1ddaba5026ddeb13ec367-188670-707-1000-jpg_250.jpg)',

  }, {
    Raw: 'akaza',
    Name: 'あかざ',
    Describe: '![akaza头像](http://ww1.sinaimg.cn/large/6c84b2d6gw1f3twgnxp0lj204q04qglu.jpg)\nAkaza，袜控，腿型很美\n![Akaza作品](http://exhentai.org/t/11/17/11178f56c948ea4caade26839057ec9c5ae65e36-691109-1409-2000-jpg_250.jpg)',

  }, {
    Raw: 'ishikei',
    Name: '石惠',
    Describe: '![石惠头像](http://ww3.sinaimg.cn/large/6c84b2d6gw1f3ymxa507xj205k05kjrm.jpg)\n浓墨厚涂榨汁机\n![石惠作品](http://exhentai.org/t/38/39/3839a8f9171d1c67415b50c99333d553be404083-1416172-2000-2837-jpg_250.jpg)',

  }, {
    Raw: 'endou hiroto',
    Name: '远藤弘土',
    Describe: '![遠藤弘土头像](http://ww1.sinaimg.cn/large/6c84b2d6gw1f3tweuayg8j204g04g74m.jpg)\n浓墨厚涂榨汁机2\n![遠藤弘土作品](http://exhentai.org/t/40/c6/40c6aa2e36f7874e2496fa477dabaa7db7c82b66-2053469-1427-2000-jpg_250.jpg)',

  }, {
    Raw: 'happoubi jin',
    Name: '八宝备仁',
    Describe: '八宝備仁(はっぽうび じん) \n ![骨感瘦弱却又是榨汁机](http://ul.ehgt.org/3e/1b/3e1b7e0a6b943bf2f1fd28cba702c916ee0337b3-396466-500-715-jpg_250.jpg)',

  }, {
    Raw: 'fujisaki hikari',
    Name: '藤崎ひかり',
    Describe: '![藤崎ひかり头像](http://ww2.sinaimg.cn/large/6c84b2d6gw1f3twnlde9zj203v04qq2s.jpg)\n萝莉！萝莉！萝莉~\n![藤崎ひかり作品1](http://exhentai.org/t/5c/2e/5c2ee1fc8286fdedcc0dfb02ce87036f7cf44458-762853-1400-2000-jpg_250.jpg)![藤崎ひかり作品2](http://exhentai.org/t/ab/b4/abb41c372777cf356e3d179d8790bf69997f034b-739317-1402-2000-jpg_250.jpg)',

  }, {
    Raw: 'ichiri',
    Name: 'イチリ',
    Describe: '![ichiri头像](http://ww4.sinaimg.cn/large/6c84b2d6gw1f3twtubhxsj204q04q74k.jpg)\n萝莉！萝莉！萝莉~\n![ichiri作品](http://exhentai.org/t/f0/52/f05278b999d0ff679d929e609cb3487d2a9e6eed-701458-2100-3004-jpg_250.jpg)',

  }, {
    Raw: 'satou kibi',
    Name: 'さとうきび',
    Describe: '![さとうきび头像](http://ww1.sinaimg.cn/large/6c84b2d6gw1f3twxmi433j204q04qwes.jpg)\n阳光又可爱的东方~\n![さとうきび作品](http://ul.ehgt.org/13/71/137143c421272e951aab33ac001fc73f1f125b9b-1341000-1410-2000-jpg_250.jpg)',

  }, {
    Raw: 'nanpuu',
    Name: 'なんぷぅ',
    Describe: '![nanpuu头像](http://ww1.sinaimg.cn/large/6c84b2d6gw1f3tx3gr6jtj203j04q3yj.jpg)\n萝莉！萝莉！萝莉~\n![nanpuu作品](http://exhentai.org/t/9d/61/9d61e90be122e31d238883adcbe4a2e6e3f8feb4-1784607-1411-2000-jpg_250.jpg)',

  }, {
    Raw: 'yukiu con',
    Name: '雪雨こん',
    Describe: '![雪雨こん头像](http://ww1.sinaimg.cn/large/6c84b2d6gw1f3tx7gqoifj204q04qq37.jpg)\n二妹！二妹！二妹~\n![nanpuu作品](http://ul.ehgt.org/8b/d6/8bd6fa12a0c51561397940432fa85a7db82b9eed-701663-2130-3047-jpg_250.jpg)',

  }, {
    Raw: 'land sale',
    Name: '蘭戸せる',
    Describe: '![蘭戸せる头像](http://ww4.sinaimg.cn/large/6c84b2d6gw1f3tx9au020j204q04qjrj.jpg)\n二妹！二妹！二妹~\n![蘭戸せる作品](http://exhentai.org/t/bd/9f/bd9fb746ba895d019aac2cd84a7a9bcde1aef500-1095269-1400-2013-jpg_250.jpg)',

  }, {
    Raw: 'emily',
    Name: 'emily',
    Describe: '![emily头像](http://ww2.sinaimg.cn/large/6c84b2d6gw1f3txb9wklcj204q04qmxj.jpg)\n萝莉！萝莉！萝莉~\n![emily作品](http://exhentai.org/t/f9/90/f9907e06268b6d62a9b9705fc5f4891af63e44ed-122897-800-600-jpg_250.jpg)',

  }, {
    Raw: 'chiri',
    Name: 'ちり',
    Describe: '![ちり头像](http://ww3.sinaimg.cn/large/6c84b2d6gw1f3tz43bqjoj204q04q3yz.jpg)\n萝莉！萝莉！萝莉~\n![ちり作品](http://exhentai.org/t/13/bc/13bcf50600c232d434d2c39ca0d56d8889c5618d-1306943-2123-3000-jpg_250.jpg)',

  }, {
    Raw: 'kantoku',
    Name: '监督',
    Describe: '![监督头像](http://ww4.sinaimg.cn/large/6c84b2d6gw1f3y8bdpm2pj204q04qwf7.jpg)\n监督（カントク，Kantoku），格子萌少女\n![作品](http://ul.ehgt.org/e0/5f/e05f32806c27b7adeea062b470696d263a4dd3e2-1345066-2487-3500-jpg_250.jpg)',

  }, {
    Raw: 'sayori',
    Name: 'Sayori',
    Describe: '![SA姐头像](http://ww2.sinaimg.cn/large/6c84b2d6jw1f42ciho6cpg204q04qjyu.gif)\nsayori（さより），SA姐是女性的原画家和插图画家，湖南出身，现居于日本，现为游戏公司美工。同人活动多以「NEKO WORKs」名义参加。有许多画集，大多为东方project同人系列，和自己原创的猫耳萝莉neko para系列。\n![作品](http://ul.ehgt.org/71/e1/71e137218b7b6e79a5f60184487ffc4134774c97-3795446-3500-2485-jpg_l.jpg)![作品](http://ul.ehgt.org/86/3e/863ea4179d24f3a6f4fa9e74a95b86b88df3494c-3422011-3482-2492-jpg_l.jpg)',

  }, {
    Raw: 'ideolo',
    Name: 'ideolo',
    Describe: '![ideolo头像](http://ww2.sinaimg.cn/large/6c84b2d6jw1f42ci9uy9rj204l04q0ss.jpg)\n国人绘师ideolo，原籍上海，现于日本留学中。他在中日两国同人圈内都拥有相当人气，插画题材以东方PROJECT系列居多，曾多次为博丽神社例大祭等日本同人活动绘制公式绘。\n![作品](http://ul.ehgt.org/59/2e/592e882202682d26601ffac477533747ec9e2d75-3563646-2544-3641-jpg_l.jpg)![作品](http://ul.ehgt.org/ca/18/ca18e275980c19ef7348fa1991900ea6fbf2eb7d-3580334-3635-2560-jpg_l.jpg)',

  }, {
    Raw: 'sky',
    Name: 'SKY | Sky-FreeDom',
    Describe: '该条目可能指向两位画师\nSKY pixivID:315442\n“死盖” pixivID:1017056\n“死盖”是马来西亚同人画师，格子裙热裤过膝袜爱好者。因画风独特以及对热裤的热爱而闻名。与林大B、孙渣、萌娘百科更新姬经常在微博进行不可告人的PY交易\n本人自画像\n![本人自画像](http://wx1.sinaimg.cn/bmiddle/6ca93fadly1ff64bbcyidj20li0xcdk8.jpg)\n本人自拍\n![自拍2](http://wx3.sinaimg.cn/mw690/6ca93fadgy1fisz6lxz1zj20go0rsth0.jpg)![自拍2](http://wx1.sinaimg.cn/mw690/6ca93fadgy1fisz6m1aruj20rs0fngqk.jpg)',
  }, {
    Raw: 'm.vv',
    Name: 'M.vv',
    Describe: '![P站头像](https://www.pixiv.net/member.php?id=1601715)\npixivID:1601715\nM.vv(Maid.vivi)是中国大陆女性画师，现居于辽宁省沈阳市。同人活动以「KiraStar」名义参加。 \n![作品](http://ehgt.org/t/17/ea/17ea751108ef0b86ee7d8ae1b64dc79334a7d8d1-995709-1001-1415-jpg_l.jpg)\n本人自拍\n![自拍](http://wx4.sinaimg.cn/mw690/5b1b04e6ly1fjjxwy9hswj20hn0uv48a.jpg)',
  }, {
    Raw: 'miyahara ayumu',
    Name: '宫原步',
    Describe: '纯爱\n![宮原歩作品](https://farm8.staticflickr.com/7399/26446169844_6f45a388e4_b.jpg)',
  }, {
    Raw: 'nishikawa kou',
    Name: '西川康',
    Describe: '![西川康作品](https://farm8.staticflickr.com/7435/26480152744_01cfe2495a_q.jpg)',
  }, {
    Raw: 'narusawa kei',
    Name: 'なるさわ景',
    Describe: '![なるさわ景作品](https://farm8.staticflickr.com/7321/26983810621_9bd5255e8a_m.jpg)',
  }, {
    Raw: 'akatsuki myuuto',
    Name: '赤月みゅうと',
    Describe: '![赤月みゅうと作品](https://farm8.staticflickr.com/7741/26990957842_e6fbd157af_m.jpg)',
  }, {
    Raw: 'kisaragi gunma',
    Name: '如月群真',
    Describe: '![如月群真](https://farm8.staticflickr.com/7441/26448650873_5282626930.jpg)',
  }, {
    Raw: 'ohtomo takuji',
    Name: '大友卓二',
    Describe: '![たくじ](https://ehgt.org/5c/2d/5c2db0cbf62529b4dc0ec012aa3cf431d2136999-1711821-1281-1800-jpg_l.jpg)',

  }, {
    Raw: 'yamada no seikatu ga daiichi',
    Name: '山田の性活が第一',
    Describe: '',

  }, {
    Raw: 'asamura hiori',
    Name: '朝丛志描',
    Describe: '',

  }, {
    Raw: 'matsukawa',
    Name: '松河',
    Describe: '',

  }, {
    Raw: 'mmm',
    Name: 'えむ',
    Describe: '',

  }, {
    Raw: 'facominn',
    Name: 'Facominn',
    Describe: '',

  }, {
    Raw: 'great mosu',
    Name: 'ぐれーともす',
    Describe: '',

  }, {
    Raw: 'ringo sui',
    Name: 'りんご水',
    Describe: '',

  }, {
    Raw: 'kanzaki muyu',
    Name: '神崎むゆ',
    Describe: '',

  }, {
    Raw: 'mizuyan',
    Name: 'みずやん',
    Describe: '',

  }, {
    Raw: 'ranyues',
    Name: '仴',
    Describe: '',

  }, {
    Raw: 'horonamin',
    Name: 'ホロナミン',
    Describe: '',

  }, {
    Raw: 'chiyami',
    Name: 'ちやみ',
    Describe: '',

  }, {
    Raw: 'hanahanamaki',
    Name: '花花卷',
    Describe: '',

  }, {
    Raw: 'sousouman',
    Name: '草草馒',
    Describe: '',

  }, {
    Raw: 'muk',
    Name: 'MUK',
    Describe: '',

  }, {
    Raw: 'ore p 1-gou',
    Name: '俺P1号',
    Describe: '',

  }, {
    Raw: 'menyoujan',
    Name: 'めんようじゃん',
    Describe: '',

  }, {
    Raw: 'hodumi kaoru',
    Name: '八月朔日珈瑠',
    Describe: '',

  }, {
    Raw: 'watsuki rumi',
    Name: 'わつきるみ',
    Describe: '',

  }, {
    Raw: 'soramoti',
    Name: 'そらモチ',
    Describe: '',

  }, {
    Raw: 'blastbeat',
    Name: 'BLASTBEAT',
    Describe: '',

  }, {
    Raw: 'takashina at masato',
    Name: '高阶@圣人',
    Describe: '',

  }, {
    Raw: 'shibayuki',
    Name: 'しばゆき',
    Describe: '',

  }, {
    Raw: 'newmen',
    Name: 'NeWMeN',
    Describe: '',

  }, {
    Raw: 'miyasaka miyu',
    Name: '宮坂みゆ',
    Describe: '',

  }, {
    Raw: 'miyasaka naco',
    Name: '宮坂なこ',
    Describe: '',

  }, {
    Raw: 'shimahara',
    Name: '40原',
    Describe: '',

  }, {
    Raw: 'hayakawa akari',
    Name: '早川あかり',
    Describe: '',

  }, {
    Raw: 'masaharu',
    Name: 'まさはる',
    Describe: '',

  }, {
    Raw: 'ail',
    Name: 'あいる',
    Describe: '',

  }, {
    Raw: 'saigado',
    Name: '彩画堂',
    Describe: '',

  }, {
    Raw: 'nanase meruchi',
    Name: 'ななせめるち',
    Describe: '',

  }, {
    Raw: 'marushin',
    Name: '丸新',
    Describe: '',

  }, {
    Raw: 'amamiya mizuki',
    Name: '雨宮ミズキ',
    Describe: '',

  }, {
    Raw: 'mibu natsuki',
    Name: 'みぶなつき',
    Describe: '',

  }, {
    Raw: 'ogata zen',
    Name: '尾形全',
    Describe: '',

  }, {
    Raw: 'himura kiseki',
    Name: '比村奇石',
    Describe: '比村乳业\n![图](# "http://ehgt.org/3e/5b/3e5b96dd2f364ba9cc06d2e16769b25f10e66362-1755259-1020-1530-jpg_l.jpg")![图](# "http://ehgt.org/32/90/32903c2f738252dcfc74b875572d893a2e3693f0-2947291-2133-3033-jpg_l.jpg")![图](# "http://ehgt.org/0a/0a/0a0a41cb451363706eec08155323917811d940fb-886627-2116-3042-jpg_l.jpg")',

  }, {
    Raw: 'cle masahiro',
    Name: '呉マサヒロ',
    Describe: '',

  }, {
    Raw: 'nakajima yuka',
    Name: 'なかじまゆか',
    Describe: '',

  }, {
    Raw: 'fujima takuya',
    Name: '藤真拓哉',
    Describe: '',

  }, {
    Raw: 'hisasi',
    Name: 'Hisasi',
    Describe: '',

  }, {
    Raw: 'akizora momidi',
    Name: '秋空もみぢ',
    Describe: '',

  }, {
    Raw: 'yuunagi sesina',
    Name: '夕凪セシナ',
    Describe: '',

  }, {
    Raw: 'ippongui',
    Name: '一本杭',
    Describe: '',

  }, {
    Raw: 'sekine hajime',
    Name: '咳寝はじめ',
    Describe: '',

  }, {
    Raw: 'mura osamu',
    Name: 'ムラオサム',
    Describe: '',

  }, {
    Raw: 'sody',
    Name: 'Sody',
    Describe: '',

  }, {
    Raw: 'fujiwara shunichi',
    Name: '藤原俊一',
    Describe: '',

  }, {
    Raw: 'ohigetan',
    Name: '尾髭丹',
    Describe: '',

  }, {
    Raw: 'kisaragi-mic',
    Name: '如月みっく',
    Describe: '',

  }, {
    Raw: 'kisaragi-ice',
    Name: '如月あいす',
    Describe: '',

  }, {
    Raw: 'takanashi rei',
    Name: '小鳥遊レイ',
    Describe: '',

  }, {
    Raw: 'kawakami rokkaku',
    Name: '川上六角',
    Describe: '',

  }, {
    Raw: 'niro',
    Name: 'にろ',
    Describe: '',

  }, {
    Raw: 'okuri banto',
    Name: '送り萬都',
    Describe: '',

  }, {
    Raw: 'runrun',
    Name: 'るんるん',
    Describe: '',

  }, {
    Raw: 'zonda',
    Name: 'ぞんだ',
    Describe: '',

  }, {
    Raw: 'bekkankou',
    Name: 'べっかんこう',
    Describe: '',

  }, {
    Raw: 'santa matsuri',
    Name: 'さんた茉莉',
    Describe: '',

  }, {
    Raw: 'quick wiper',
    Name: 'クイック賄派',
    Describe: '',

  }, {
    Raw: 'jigoku ouji',
    Name: '地狱王子',
    Describe: '',

  }, {
    Raw: 'kobayashi youkoh',
    Name: '小林由高',
    Describe: '',

  }, {
    Raw: 'saeki tatsuya',
    Name: '佐伯达也',
    Describe: '',

  }, {
    Raw: 'mamo williams',
    Name: 'まもウィリアムズ',
    Describe: '',

  }, {
    Raw: 'koga nozomu',
    Name: '古我望',
    Describe: '',

  }, {
    Raw: 'shinokawa arumi',
    Name: '篠川あるみ',
    Describe: '',

  }, {
    Raw: 'ichio',
    Name: 'イチオ',
    Describe: '',

  }, {
    Raw: 'shimada fumikane',
    Name: '島田フミカネ',
    Describe: '',

  }, {
    Raw: 'ryohka',
    Name: '凉香',
    Describe: '',

  }, {
    Raw: 'shinkai makoto',
    Name: '新海诚',
    Describe: '动画导演',

  }, {
    Raw: 'benet',
    Name: 'ベネット',
    Describe: '',

  }, {
    Raw: 'ponpon',
    Name: 'PONPON',
    Describe: '',

  }, {
    Raw: 'tetsujin',
    Name: '铁人',
    Describe: '',

  }, {
    Raw: 'hiyoko',
    Name: 'ひよこ',
    Describe: '',

  }, {
    Raw: 'syukurin',
    Name: 'シュクリーン',
    Describe: '',

  }, {
    Raw: 'araki kanao',
    Name: 'あらきかなお',
    Describe: '',

  }, {
    Raw: 'nagiyama',
    Name: '那岐山',
    Describe: '',

  }, {
    Raw: 'kittsu',
    Name: 'キッツ',
    Describe: '',

  }, {
    Raw: 'neko toufu',
    Name: 'ねことうふ',
    Describe: '',

  }, {
    Raw: 'nagare hyo-go',
    Name: '流ひょうご',
    Describe: '',

  }, {
    Raw: 'mizuki gyokuran',
    Name: '瑞姬玉兰',
    Describe: '',

  }, {
    Raw: 'tenchisouha',
    Name: '天地争霸',
    Describe: '',

  }, {
    Raw: 'arui ryou',
    Name: 'あるい椋',
    Describe: '',

  }, {
    Raw: 'sasamori tomoe',
    Name: '笹森トモエ',
    Describe: '',

  }, {
    Raw: 'sasai saji',
    Name: '笹井さじ',
    Describe: '',

  }, {
    Raw: 'okazaki takeshi',
    Name: '冈崎武士',
    Describe: '',

  }, {
    Raw: 'harukaze soyogu',
    Name: '春風ソヨグ',
    Describe: '',

  }, {
    Raw: 'kasi',
    Name: '华师',
    Describe: '',

  }, {
    Raw: 'cheru',
    Name: 'ちぇる',
    Describe: '',

  }, {
    Raw: 'umedama nabu',
    Name: '梅玉奈部',
    Describe: '',

  }, {
    Raw: 'aranmaru',
    Name: '亚兰丸',
    Describe: '',

  }, {
    Raw: 'tachibana omina',
    Name: '立花オミナ',
    Describe: '',

  }, {
    Raw: 'ibuki ren',
    Name: '伊吹莲',
    Describe: '',

  }, {
    Raw: 'uran',
    Name: 'URAN | 雨兰',
    Describe: '',

  }, {
    Raw: 'billion',
    Name: 'Billion',
    Describe: '',

  }, {
    Raw: 'nanao',
    Name: 'ななお',
    Describe: '',

  }, {
    Raw: 'pirontan',
    Name: 'ピロンタン',
    Describe: '',

  }, {
    Raw: 'tokyo yamane',
    Name: '東京ヤマネ',
    Describe: '',

  }, {
    Raw: 'yuki higasinakano',
    Name: 'ゆーき東中野',
    Describe: '',

  }, {
    Raw: 'nosada',
    Name: '乃定',
    Describe: '',

  }, {
    Raw: 'yukibuster z',
    Name: 'ユキバスターZ',
    Describe: '',

  }, {
    Raw: 'roga',
    Name: 'RoGa',
    Describe: '',

  }, {
    Raw: 'bonnari',
    Name: 'ぼんなり',
    Describe: '',

  }, {
    Raw: 'komone ushio',
    Name: '相音うしお',
    Describe: '',

  }, {
    Raw: 'yuriko',
    Name: '白河子',
    Describe: '',

  }, {
    Raw: 'nanno koto',
    Name: '南野琴',
    Describe: '',

  }, {
    Raw: 'minazuki mikka',
    Name: '水无月三日',
    Describe: '',

  }, {
    Raw: 'minazuki juuzou',
    Name: '水无月十三',
    Describe: '',

  }, {
    Raw: 'minazuki tooru',
    Name: '水无月彻',
    Describe: '',

  }, {
    Raw: 'minazuki no-mu',
    Name: '水無月のーむ',
    Describe: '',

  }, {
    Raw: 'minazuki satoshi',
    Name: '水無月サトシ',
    Describe: '',

  }, {
    Raw: 'minazuki futago',
    Name: 'みなづきふたご',
    Describe: '',

  }, {
    Raw: 'minazuki tsuyuha',
    Name: '水无月露叶',
    Describe: '',

  }, {
    Raw: 'minaduki kanna',
    Name: '水无月神奈',
    Describe: '',

  }, {
    Raw: 'karaage tarou',
    Name: 'からあげ太郎',
    Describe: '',

  }, {
    Raw: 'okumori boy',
    Name: '奥森ボウイ',
    Describe: '',

  }, {
    Raw: 'sahara wataru',
    Name: '砂原涉',
    Describe: '',

  }, {
    Raw: 'amano kazumi',
    Name: '天乃一水',
    Describe: '',

  }, {
    Raw: 'ichiyo moka',
    Name: '一葉モカ',
    Describe: '',

  }, {
    Raw: 'naturalton',
    Name: 'なちゅらるとん',
    Describe: '',

  }, {
    Raw: 'aono ribbon',
    Name: '青野りぼん',
    Describe: '',

  }, {
    Raw: 'hidaka toworu',
    Name: 'ヒダカトヲル',
    Describe: '',

  }, {
    Raw: 'rara8',
    Name: 'らら8',
    Describe: '',

  }, {
    Raw: 'medaka kenichi',
    Name: '目高健一',
    Describe: '',

  }, {
    Raw: 'kanna',
    Name: 'かん奈',
    Describe: '',

  }, {
    Raw: 'fujutsushi',
    Name: '风术师',
    Describe: '',

  }, {
    Raw: 'fubuki poni',
    Name: '風吹ぽに',
    Describe: '',

  }, {
    Raw: 'yari ashito',
    Name: '大枪苇人',
    Describe: '',

  }, {
    Raw: 'ouma tokiichi',
    Name: '逢魔刻壹',
    Describe: '',

  }, {
    Raw: 'momonoki fum',
    Name: '百乃木富梦',
    Describe: '',

  }, {
    Raw: 'miito shido',
    Name: '三糸シド',
    Describe: '',

  }, {
    Raw: 'motomiya mitsuki',
    Name: 'もとみやみつき',
    Describe: '',

  }, {
    Raw: 'interstellar',
    Name: 'Interstellar',
    Describe: '',

  }, {
    Raw: 'mikeou',
    Name: 'みけおう',
    Describe: '',

  }, {
    Raw: 'hinata nao',
    Name: '日向奈尾',
    Describe: '',

  }, {
    Raw: 'sakurazaka tsuchiyu',
    Name: '桜坂つちゆ',
    Describe: '',

  }, {
    Raw: 'yamakaze ran',
    Name: 'やまかぜ嵐',
    Describe: '',

  }, {
    Raw: 'anko',
    Name: 'あん子 | あんこ',
    Describe: '',

  }, {
    Raw: 'koguro.',
    Name: 'こぐろ。',
    Describe: '',

  }, {
    Raw: 'kousaka jun',
    Name: '香坂纯',
    Describe: '',

  }, {
    Raw: 'gerotan',
    Name: 'げろたん',
    Describe: '',

  }, {
    Raw: 'kozakura kumaneko',
    Name: '小桜クマネコ',
    Describe: '',

  }, {
    Raw: 'distance',
    Name: 'DISTANCE',
    Describe: '',

  }, {
    Raw: 'kawaraya a-ta',
    Name: '瓦屋A太',
    Describe: '',

  }, {
    Raw: 'usou',
    Name: '雨草',
    Describe: '',

  }, {
    Raw: 'awayume',
    Name: '淡梦',
    Describe: '',

  }, {
    Raw: 'shiroo',
    Name: 'しろー',
    Describe: '',

  }, {
    Raw: 'ryokucha',
    Name: '绿茶',
    Describe: '',

  }, {
    Raw: 'niimaru yuu',
    Name: 'ニイマルユウ',
    Describe: '',

  }, {
    Raw: 'simon',
    Name: 'さいもん',
    Describe: '',

  }, {
    Raw: 'tanaka aji',
    Name: '田中あじ',
    Describe: '',

  }, {
    Raw: 'unadon',
    Name: 'うな丼',
    Describe: '',

  }, {
    Raw: 'otakumin',
    Name: 'オタクミン',
    Describe: '',

  }, {
    Raw: 'muneshiro',
    Name: 'むねしろ',
    Describe: '',

  }, {
    Raw: 'haruki genia',
    Name: 'はるきゲにあ',
    Describe: '',

  }, {
    Raw: 'ikegami tatsuya',
    Name: '池上竜矢',
    Describe: '',

  }, {
    Raw: 'pony r',
    Name: 'ポニーR',
    Describe: '',

  }, {
    Raw: 'sakura yuu',
    Name: 'さくら★ゆう',
    Describe: '',

  }, {
    Raw: 'yan-yam',
    Name: 'Yan-Yam',
    Describe: '',

  }, {
    Raw: 'watanabe kenpo',
    Name: '渡边宪法',
    Describe: '',

  }, {
    Raw: 'kamiya zuzu',
    Name: '神谷ズズ',
    Describe: '',

  }, {
    Raw: 'maruta itsuki',
    Name: '丸汰いつき',
    Describe: '',

  }, {
    Raw: 'yasakani an',
    Name: 'ヤサカニ·アン',
    Describe: '',

  }, {
    Raw: 'ayachi',
    Name: 'あやち',
    Describe: '',

  }, {
    Raw: 'kurori',
    Name: 'くろり',
    Describe: '',

  }, {
    Raw: 'suwa izumo',
    Name: '诹访出云',
    Describe: '',

  }, {
    Raw: 'ishigami kazui',
    Name: '石神一威',
    Describe: '',

  }, {
    Raw: 'kamogawa tanuki',
    Name: '鸭川狸',
    Describe: '鴨川たぬき',
    externalLinks: '[pixiv](https://www.pixiv.net/member.php?id=346654) [twitter](https://twitter.com/kamogawaya)'
  }, {
    Raw: 'shiruka bakaudon',
    Name: '知るかバカうどん',
    Describe: '',

  }, {
    Raw: 'amekosame',
    Name: '雨小雨',
    Describe: '',

  }, {
    Raw: 'kiira',
    Name: 'きぃら～☆',
    Describe: '',

  }, {
    Raw: 'kanoe',
    Name: '庚',
    Describe: '',

  }, {
    Raw: 'daichi kouta',
    Name: '大地巧太',
    Describe: '',

  }, {
    Raw: 'awatake takahiro',
    Name: '弘岳粟高',
    Describe: '',

  }, {
    Raw: 'kylin',
    Name: 'Kylin',
    Describe: '',

  }, {
    Raw: 'morishima kon',
    Name: '森島コン',
    Describe: '',

  }, {
    Raw: 'mdo-h',
    Name: '无道睿智',
    Describe: '',

  }, {
    Raw: 'ginyou haru',
    Name: '銀曜ハル',
    Describe: '',

  }, {
    Raw: 'shiina',
    Name: 'シイナ',
    Describe: '',

  }, {
    Raw: 'mikuta',
    Name: 'みくた',
    Describe: '',

  }, {
    Raw: 'shibasaki syouzi',
    Name: '柴崎ショージ',
    Describe: '',

  }, {
    Raw: 'tempo gensui',
    Name: '天蓬元帅',
    Describe: '',

  }, {
    Raw: 'mafuyu',
    Name: '真冬',
    Describe: '',

  }, {
    Raw: 'kakugari kyoudai',
    Name: 'カクガリ兄弟',
    Describe: '',

  }, {
    Raw: 'matsumomo mahiru',
    Name: '松百まひる',
    Describe: '',

  }, {
    Raw: 'aoi masami',
    Name: '苍海',
    Describe: '',

  }, {
    Raw: 'itou life',
    Name: '伊東ライフ',
    Describe: '',

  }, {
    Raw: 'taniguchi-san',
    Name: '谷口さん',
    Describe: '',

  }, {
    Raw: 'amou mari',
    Name: '天羽真理',
    Describe: '',

  }, {
    Raw: 'tsuttsu',
    Name: 'つっつ',
    Describe: '',

  }, {
    Raw: 'minarai zouhyou',
    Name: '見習い雑兵',
    Describe: '',

  }, {
    Raw: 'aya',
    Name: 'AYA | 蓝夜',
    Describe: 'お嬢の浴室\nTWILIGHT DUSK',

  }, {
    Raw: 'shiba junko',
    Name: '司马淳子',
    Describe: '',

  }, {
    Raw: 'sato-satoru',
    Name: 'さとーさとる',
    Describe: '',

  }, {
    Raw: 'gengorou',
    Name: '源五郎',
    Describe: '',

  }, {
    Raw: 'rokuyo ten',
    Name: '六曜テン',
    Describe: '',

  }, {
    Raw: 'mitsuru',
    Name: 'みつる',
    Describe: '',

  }, {
    Raw: 'rage',
    Name: 'らげ',
    Describe: '',

  }, {
    Raw: 'chouzetsu bishoujo mine',
    Name: '超绝美少女mine',
    Describe: '',

  }, {
    Raw: 'fried',
    Name: 'ふりいど',
    Describe: '',

  }, {
    Raw: 'kouji',
    Name: '孝治',
    Describe: '',

  }, {
    Raw: 'sanada',
    Name: 'さなだ',
    Describe: '',

  }, {
    Raw: 'shikei',
    Name: 'しけー',
    Describe: '',

  }, {
    Raw: 'ruri',
    Name: 'ルリ | るり | 瑠璃',
    Describe: 'MAGNOLIA\nStayBlue\nVOLLMOND',

  }, {
    Raw: 'kohata tsunechika',
    Name: '小旗つねちか',
    Describe: '',

  }, {
    Raw: 'carn',
    Name: '夏庵',
    Describe: '',

  }, {
    Raw: 'okada kou',
    Name: '岡田コウ',
    Describe: '',

  }, {
    Raw: 'neko pantsu',
    Name: 'ねこパンツ',
    Describe: '',

  }, {
    Raw: 'suzunone rena',
    Name: '鈴音れな',
    Describe: '',

  }, {
    Raw: 'miyabi',
    Name: '美矢火',
    Describe: '',

  }, {
    Raw: 'pochi.',
    Name: 'ぽち。',
    Describe: '',

  }, {
    Raw: 'hayami jun',
    Name: '早见纯',
    Describe: '',

  }, {
    Raw: 'katou chakichi',
    Name: '加藤茶吉',
    Describe: '',

  }, {
    Raw: 'taono kinoko',
    Name: '汰尾乃きのこ',
    Describe: '',

  }, {
    Raw: 'aikawa monako',
    Name: 'あいかわモナコ',
    Describe: '',

  }, {
    Raw: 'tenma femio',
    Name: '天馬ふぇみお',
    Describe: '',

  }, {
    Raw: 'kurusumin',
    Name: '来须眠',
    Describe: '',

  }, {
    Raw: 'chobi',
    Name: 'ちょび',
    Describe: '',

  }, {
    Raw: 'norakuro nero',
    Name: '野良黒ネロ',
    Describe: '',

  }, {
    Raw: 'izumi yuujiro',
    Name: '泉ゆうじろ～',
    Describe: '',

  }, {
    Raw: 'itameshi',
    Name: '炒饭',
    Describe: '',

  }, {
    Raw: 'hiraoka ryuichi',
    Name: '平冈龙一',
    Describe: '',

  }, {
    Raw: 'maguro teikoku',
    Name: 'まぐろ帝國',
    Describe: '',

  }, {
    Raw: 'pote',
    Name: 'ぽて',
    Describe: '',

  }, {
    Raw: 'karakuchi choucream',
    Name: '辛口しゅーくりーむ',
    Describe: '',

  }, {
    Raw: 'mafen',
    Name: 'マフェン',
    Describe: '',

  }, {
    Raw: 'kuroda kuro',
    Name: '黒田クロ',
    Describe: '',

  }, {
    Raw: 'ooooalikui',
    Name: 'おおおおありくい',
    Describe: '',

  }, {
    Raw: 'juna juna juice',
    Name: 'ジュナジュナジュース',
    Describe: '',

  }, {
    Raw: 'hiro hiroki',
    Name: 'ひろひろき',
    Describe: '',

  }, {
    Raw: 'yone kinji',
    Name: '与根金次',
    Describe: '',

  }, {
    Raw: 'zankuro',
    Name: 'ザンクロー',
    Describe: '',

  }, {
    Raw: 'wa',
    Name: 'WA',
    Describe: '',

  }, {
    Raw: 'satou kuuki',
    Name: '左藤空气',
    Describe: '',

  }, {
    Raw: 'kouzuki hajime',
    Name: '香月一花',
    Describe: '',

  }, {
    Raw: 'furukawa remon',
    Name: '古川れもん',
    Describe: '',

  }, {
    Raw: 'nukunuku batten',
    Name: 'ぬくぬくばってん',
    Describe: '',

  }, {
    Raw: 'sadokko',
    Name: 'さどっこ',
    Describe: '',

  }, {
    Raw: 'izumi',
    Name: '和泉',
    Describe: '',

  }, {
    Raw: 'reizei',
    Name: '冷泉',
    Describe: '',

  }, {
    Raw: 'petenshi',
    Name: 'ペテン師',
    Describe: '',

  }, {
    Raw: 'maruwa tarou',
    Name: '丸和太郎',
    Describe: '',

  }, {
    Raw: 'fujishima sei1go',
    Name: '藤岛制1号',
    Describe: '',

  }, {
    Raw: 'nanotsuki',
    Name: 'なのつき',
    Describe: '',

  }, {
    Raw: 'norutaru',
    Name: 'のるたる',
    Describe: '',

  }, {
    Raw: 'koi',
    Name: 'Koi',
    Describe: 'Koi是日本的漫画家、画师。 现住在东京都。作品类型为四格漫画。代表作是《请问您今天要来点兔子吗》。',

  }, {
    Raw: 'koishi chikasa',
    Name: '小石ちかさ',
    Describe: '',

  }, {
    Raw: 'koikawa minoru',
    Name: '恋河ミノル',
    Describe: '',

  }, {
    Raw: 'koiko irori',
    Name: '恋小いろり',
    Describe: '',

  }, {
    Raw: 'koi nobori',
    Name: 'Koiのぼり',
    Describe: '',

  }, {
    Raw: 'koiken',
    Name: 'こいけん',
    Describe: '',

  }, {
    Raw: 'koizumi hitsuji',
    Name: '小泉ひつじ',
    Describe: '',

  }, {
    Raw: 'hormone koijirou',
    Name: 'ホルモン恋次郎',
    Describe: '',

  }, {
    Raw: 'koinu',
    Name: 'こいぬ',
    Describe: '',

  }, {
    Raw: 'kinnotama',
    Name: 'またのんき▼',
    Describe: '',

  }, {
    Raw: 'suka',
    Name: 'すか',
    Describe: '',

  }, {
    Raw: 'amazon',
    Name: '雨存',
    Describe: '',

  }, {
    Raw: 'milk jam',
    Name: 'みるくジャム',
    Describe: '',

  }, {
    Raw: 'isami nozomi',
    Name: '伊佐美ノゾミ',
    Describe: '',

  }, {
    Raw: 'souryuu',
    Name: '双龙',
    Describe: '',

  }, {
    Raw: 'umi suzume',
    Name: '雨美すずめ',
    Describe: '',

  }, {
    Raw: 'michiking',
    Name: 'みちきんぐ',
    Describe: '',

  }, {
    Raw: 'otabe sakura',
    Name: 'おたべさくら',
    Describe: '',

  }, {
    Raw: 'ryo',
    Name: 'RYO | RYÖ | りょう',
    Describe: '没後\nSAILORQ2\nめたもる',

  }, {
    Raw: 'minori kenshirou',
    Name: '实验四郎',
    Describe: '',

  }, {
    Raw: 'umemura',
    Name: '梅村',
    Describe: '',

  }, {
    Raw: 'peter mitsuru',
    Name: 'ペーター・ミツル',
    Describe: '',

  }, {
    Raw: 'tennouji kitsune',
    Name: '天王寺狐',
    Describe: '天王寺狐（天王寺 きつね/天王寺 キツネ）（1965年－）是日本男性漫画家，大阪府出身，曾用笔名“天王寺动物园”、“天王寺水族馆”。自《枪械少女！！》起，笔名改为“天王寺キツネ”。',
    externalLinks: '[维基百科](https://zh.wikipedia.org/zh-cn/天王寺狐) [个人主页](http://www.lifox.co.jp/) (*)'
  }, {
    Raw: 'shikishima tenki',
    Name: '敷岛天气',
    Describe: '',

  }, {
    Raw: 'shikishima shoutarou',
    Name: '敷岛昭太郎',
    Describe: '',

  }, {
    Raw: 'siina yuuki',
    Name: '椎名悠輝',
    Describe: '',

  }, {
    Raw: 'manami tatsuya',
    Name: '真未たつや',
    Describe: '',

  }, {
    Raw: 'miharu',
    Name: '美春 | ミハル',
    Describe: 'FAKESTAR \n TTT',

  }, {
    Raw: 'mush',
    Name: 'むっしゅ',
    Describe: '',

  }, {
    Raw: 'haneinu',
    Name: '跳犬',
    Describe: '',

  }, {
    Raw: 'misaki takahiro',
    Name: '三崎高博',
    Describe: '',

  }, {
    Raw: 'sada ko-ji',
    Name: 'さだこーじ',
    Describe: '',

  }, {
    Raw: 'mikami mika',
    Name: '三上ミカ',
    Describe: '',

  }, {
    Raw: 'nagare ippon',
    Name: '流一本',
    Describe: '',

  }, {
    Raw: 'hicoromo kyouichi',
    Name: '绯衣响一',
    Describe: '',

  }, {
    Raw: 'akaze kidai',
    Name: '亚风纪代',
    Describe: '',

  }, {
    Raw: 'yuuki',
    Name: '悠宇树',
    Describe: '',

  }, {
    Raw: 'ohkami ryosuke',
    Name: '狼亮辅',
    Describe: '',

  }, {
    Raw: 'jitsuma',
    Name: '儿妻',
    Describe: '',

  }, {
    Raw: 'kawaisaw',
    Name: '可哀想',
    Describe: '',

  }, {
    Raw: 'alpha alf layla',
    Name: 'α・アルフライラ',
    Describe: '',

  }, {
    Raw: 'tori hrami',
    Name: '鳥ハラミ',
    Describe: '',

  }, {
    Raw: 'mori marimo',
    Name: 'もりまりも',
    Describe: '',

  }, {
    Raw: 'fujisaka lyric',
    Name: '藤坂リリック',
    Describe: '',

  }, {
    Raw: 'mori kouichirou',
    Name: '杜講一郎',
    Describe: '',

  }, {
    Raw: 'sakura akami',
    Name: 'さくらあかみ',
    Describe: '',

  }, {
    Raw: 'hatomugi munmun',
    Name: '鳩麦月々',
    Describe: '',

  }, {
    Raw: 'gegera toshikazu',
    Name: 'げげら俊和',
    Describe: '',

  }, {
    Raw: 'eromame',
    Name: 'えろ豆',
    Describe: '',

  }, {
    Raw: 'momoya chika',
    Name: '桃屋チカ',
    Describe: '',

  }, {
    Raw: 'ooshima tomo',
    Name: '大岛智',
    Describe: '',

  }, {
    Raw: 'hinemosu notari',
    Name: 'ひねもすのたり',
    Describe: '',

  }, {
    Raw: 'kurasawa makoto',
    Name: '倉澤まこと',
    Describe: '',

  }, {
    Raw: 'bokujou nushi k',
    Name: '牧场主K',
    Describe: '',

  }, {
    Raw: 'youta',
    Name: '夜歌 | よう太',
    Describe: '朝月堂\nあまとう',

  }, {
    Raw: 'tsumugi kyuuta',
    Name: '紬きゅうた',
    Describe: '',

  }, {
    Raw: 'diga tsukune',
    Name: '奈賀つくね',
    Describe: '',

  }, {
    Raw: 'cha mirai',
    Name: '茶みらい',
    Describe: '',

  }, {
    Raw: 'serizawa',
    Name: '芹泽',
    Describe: '',

  }, {
    Raw: 'toono suika',
    Name: '遠野すいか',
    Describe: '',

  }, {
    Raw: 'pierre yoshio',
    Name: 'ピエ～ル☆よしお',
    Describe: '',

  }, {
    Raw: 'shinji mao',
    Name: '真慈真雄',
    Describe: '',

  }, {
    Raw: 'aoi manabu',
    Name: 'あおいまなぶ',
    Describe: '',

  }, {
    Raw: 'izumi tsubasu',
    Name: '和泉つばす',
    Describe: '',

  }, {
    Raw: 'sakai hamachi',
    Name: '堺はまち',
    Describe: '',

  }, {
    Raw: 'kannazuki nem',
    Name: '神無月ねむ',
    Describe: '',

  }, {
    Raw: 'sakurabe notos',
    Name: '桜部のとす',
    Describe: '',

  }, {
    Raw: 'misaki kurehito',
    Name: '深崎暮人',
    Describe: '',

  }, {
    Raw: 'kuroya shinobu',
    Name: '黑谷忍',
    Describe: '',

  }, {
    Raw: 'san sheng wan',
    Name: '三生万',
    Describe: '',
    externalLinks: '[pixiv](https://www.pixiv.net/member.php?id=16811335)'
  }, {
    Raw: 'el',
    Name: 'える',
    Describe: '',

  }, {
    Raw: 'mango pudding',
    Name: 'まんごープリン',
    Describe: '',

  }, {
    Raw: 'gekka saeki',
    Name: '月下冴喜',
    Describe: '',

  }, {
    Raw: 'shungiku tenudon',
    Name: '春菊天うどん',
    Describe: '',

  }, {
    Raw: 'mikaduki neko',
    Name: '三日月ネコ',
    Describe: '',

  }, {
    Raw: 'aihara shouta',
    Name: '相原翔太',
    Describe: '',

  }, {
    Raw: 'mimofu',
    Name: 'みもふ',
    Describe: '',

  }, {
    Raw: 'takatuki nato',
    Name: '鷹月ナト',
    Describe: '',

  }, {
    Raw: 'shiratama',
    Name: 'しらたま',
    Describe: '',

  }, {
    Raw: 'nohara hiromi',
    Name: '野原ひろみ',
    Describe: '',

  }, {
    Raw: 'higashino mikan',
    Name: '東野みかん',
    Describe: '',

  }, {
    Raw: 'dr.bug',
    Name: 'Dr.阿虫',
    Describe: '',

  }, {
    Raw: 'ameto yuki',
    Name: 'あめとゆき',
    Describe: '',

  }, {
    Raw: 'kenkou cross',
    Name: '健康クロス',
    Describe: '',

  }, {
    Raw: 'yanagawa rio',
    Name: 'やながわ理央',
    Describe: '',

  }, {
    Raw: 'kakuzatou',
    Name: '核座头',
    Describe: '',

  }, {
    Raw: 'kaminagi',
    Name: '神凪',
    Describe: '',

  }, {
    Raw: 'twinbox',
    Name: 'TwinBox',
    Describe: '',

  }, {
    Raw: 'izuminoaru',
    Name: 'イズミノアル',
    Describe: '',

  }, {
    Raw: 'nora shinji',
    Name: '白野じん',
    Describe: '',

  }, {
    Raw: 'shihachiro',
    Name: 'しはちろ',
    Describe: '',

  }, {
    Raw: 'daikoukoku shinbun',
    Name: '大広告新聞',
    Describe: '',

  }, {
    Raw: 'yuuki hagure',
    Name: '憂姫はぐれ',
    Describe: '',

  }, {
    Raw: 'paru',
    Name: 'パル',
    Describe: '',

  }, {
    Raw: 'rikatan',
    Name: 'りかたん☆',
    Describe: '',

  }, {
    Raw: 'jaku denpa',
    Name: '弱电波',
    Describe: '',

  }, {
    Raw: 'hiyama izumi',
    Name: '火山一角',
    Describe: '',

  }, {
    Raw: 'kazuma muramasa',
    Name: '和马村政',
    Describe: '',

  }, {
    Raw: 'amatsuka china',
    Name: '天使ちな',
    Describe: '',

  }, {
    Raw: 'denki shougun',
    Name: '电气将军',
    Describe: '',

  }, {
    Raw: 'gibuchoko',
    Name: 'ぎヴちょこ',
    Describe: '',

  }, {
    Raw: 'sinbo tamaran',
    Name: '神保玉兰',
    Describe: '',

  }, {
    Raw: 'kaenuco',
    Name: 'かえぬこ',
    Describe: '',

  }, {
    Raw: 'arikawa satoru',
    Name: '有河サトル',
    Describe: '',

  }, {
    Raw: 'yui toshiki',
    Name: '唯登诗树',
    Describe: '',

  }, {
    Raw: 'kitahara tomoe',
    Name: '北原朋萌。',
    Describe: '',

  }, {
    Raw: 'kizaki yuuri',
    Name: '树崎祐里',
    Describe: '',

  }, {
    Raw: 'shio kazunoko',
    Name: '塩かずのこ',
    Describe: '',

  }, {
    Raw: 'muska',
    Name: 'むすか',
    Describe: '',

  }, {
    Raw: 'amaduyu tatsuki',
    Name: '甘露树',
    Describe: '',

  }, {
    Raw: 'kawata hisashi',
    Name: 'カワタヒサシ',
    Describe: '',

  }, {
    Raw: 'mitsumi misato',
    Name: 'みつみ美里',
    Describe: '',

  }, {
    Raw: 'nakamura takeshi',
    Name: 'なかむらたけし',
    Describe: '',

  }, {
    Raw: 'minase syu',
    Name: '水濑修',
    Describe: '',

  }, {
    Raw: 'yoshiura kazuya',
    Name: '由浦カズヤ',
    Describe: '',

  }, {
    Raw: 'erect sawaru',
    Name: 'エレクトさわる',
    Describe: '',

  }, {
    Raw: 'katsurai yoshiaki',
    Name: '桂井よしあき',
    Describe: '',

  }, {
    Raw: 'sanazura hiroyuki',
    Name: 'さなづらひろゆき',
    Describe: '',

  }, {
    Raw: 'takamura wamu',
    Name: '高村わむ',
    Describe: '',

  }, {
    Raw: 'menoko',
    Name: 'めの子',
    Describe: '',

  }, {
    Raw: 'tamon',
    Name: 'たもん',
    Describe: '',

  }, {
    Raw: 'haruaki',
    Name: '明彰',
    Describe: '',

  }, {
    Raw: 'oomori yoshiharu',
    Name: 'おおもりよしはる',
    Describe: '',

  }, {
    Raw: 'amedamacon',
    Name: '飴玉コン',
    Describe: '',

  }, {
    Raw: 'eisen',
    Name: '英战',
    Describe: '',

  }, {
    Raw: 'harigane shinshi',
    Name: '针金绅士',
    Describe: '',
    externalLinks: '[pixiv](https://www.pixiv.net/member.php?id=130689)'
  }, {
    Raw: 'kazuhiro',
    Name: '一弘',
    Describe: '',

  }, {
    Raw: 'lobster',
    Name: 'ロブ☆スター',
    Describe: '',

  }, {
    Raw: 'magifuro konnyaku',
    Name: 'magifuro蒟蒻',
    Describe: '',

  }, {
    Raw: 'ueda john',
    Name: 'うえだジョン',
    Describe: '',

  }, {
    Raw: 'wenajii',
    Name: 'ヱナジー',
    Describe: '',

  }, {
    Raw: 'zeno',
    Name: '是乃',
    Describe: '',

  }, {
    Raw: 'imizu',
    Name: '威未図',
    Describe: '',

  }, {
    Raw: 'shindou hajime',
    Name: '新道一',
    Describe: '',

  }, {
    Raw: 'type.90',
    Name: 'TYPE.90',
    Describe: '',

  }, {
    Raw: 'bu-chan',
    Name: 'ぶーちゃん',
    Describe: '',

  }, {
    Raw: 'sasahiro',
    Name: '笹弘',
    Describe: '',

  }, {
    Raw: 'haikawa hemlen',
    Name: '灰川ヘムレン',
    Describe: '',

  }, {
    Raw: 'harasho',
    Name: 'はらしょ',
    Describe: '',

  }, {
    Raw: 'nishimu',
    Name: 'にしむ',
    Describe: '',

  }, {
    Raw: 'narita koh',
    Name: '成田コウ',
    Describe: '',

  }, {
    Raw: 'shiden',
    Name: 'しでん',
    Describe: '',

  }, {
    Raw: 'mira',
    Name: 'みら | 未镜',
    Describe: 'peachpulsar\nMirrorWorld',

  }, {
    Raw: 'fuusen club',
    Name: '風船クラブ',
    Describe: '',

  }, {
    Raw: 'shioroku',
    Name: 'シオロク',
    Describe: '',

  }, {
    Raw: 'kaname aomame',
    Name: '要青豆',
    Describe: '',

  }, {
    Raw: 'kouno yukiyo',
    Name: 'こうのゆきよ',
    Describe: '',

  }, {
    Raw: 'seno fumiki',
    Name: '濑野文希',
    Describe: '',

  }, {
    Raw: 'shimuu',
    Name: 'しゃむ',
    Describe: '',

  }, {
    Raw: 'rie-chan 14-sai',
    Name: 'りえちゃん14歳',
    Describe: '',

  }, {
    Raw: 'fukori',
    Name: 'フコリ',
    Describe: '',

  }, {
    Raw: 'shinyashiki',
    Name: '新屋敷',
    Describe: '',

  }, {
    Raw: 'kanzume',
    Name: 'KANZUME',
    Describe: '',

  }, {
    Raw: 'kishimen',
    Name: 'きしめん',
    Describe: '',

  }, {
    Raw: 'ken-1',
    Name: 'Ken-1',
    Describe: '',

  }, {
    Raw: 'midoh tsukasa',
    Name: '御堂つかさ',
    Describe: '',

  }, {
    Raw: 'oyama yasunaga',
    Name: '尾山泰永',
    Describe: '',

  }, {
    Raw: 'kino hitoshi',
    Name: '鬼ノ仁',
    Describe: '',

  }, {
    Raw: 'tam-u',
    Name: 'Tam-U',
    Describe: '',

  }, {
    Raw: 'lunaluku',
    Name: 'るなるく',
    Describe: '',

  }, {
    Raw: 'shiokonbu',
    Name: 'しおこんぶ',
    Describe: '',

  }, {
    Raw: 'mon-mon',
    Name: 'MON-MON',
    Describe: '',

  }, {
    Raw: 'kohoshi moe',
    Name: '小星萌',
    Describe: '',

  }, {
    Raw: 'kurumiko',
    Name: '胡桃子',
    Describe: '',

  }, {
    Raw: 'hirari',
    Name: 'ひらり',
    Describe: '',

  }, {
    Raw: 'aoi nagisa',
    Name: '葵渚',
    Describe: '',

  }, {
    Raw: 'alde hyde',
    Name: 'アルデヒド',
    Describe: '',

  }, {
    Raw: 'mutsuno hexa',
    Name: '六ツ野へきさ',
    Describe: '',

  }, {
    Raw: 'takenokoya',
    Name: '筍屋',
    Describe: '',

  }, {
    Raw: 'ankoku tiger',
    Name: '暗黒タイガー',
    Describe: '',

  }, {
    Raw: 'kakkii',
    Name: 'かっきー',
    Describe: '',

  }, {
    Raw: 'shizuki shuya',
    Name: '紫月秋夜',
    Describe: '',

  }, {
    Raw: 'himukai kyousuke',
    Name: '日向恭介',
    Describe: '',

  }, {
    Raw: 'fuyutugu',
    Name: '冬嗣',
    Describe: '',

  }, {
    Raw: 'mogudan',
    Name: 'モグダン',
    Describe: '',

  }, {
    Raw: '100yen locker',
    Name: '100円ロッカー',
    Describe: '',

  }, {
    Raw: 'naruya taka',
    Name: '成矢タカ',
    Describe: '',

  }, {
    Raw: 'hana hook',
    Name: '華フック',
    Describe: '',

  }, {
    Raw: 'taki minashika',
    Name: '滝美梨香',
    Describe: '',

  }, {
    Raw: 'hirame',
    Name: 'ヒラメ | 比目鱼',
    Describe: '★F\n龟鱼派',

  }, {
    Raw: 'minakami rinka',
    Name: '水上凛香',
    Describe: '',

  }, {
    Raw: 'andou shuki',
    Name: '安藤周记',
    Describe: '',

  }, {
    Raw: 'nakata shunpei',
    Name: '中田春平',
    Describe: '',

  }, {
    Raw: 'kurun',
    Name: 'くるん',
    Describe: '',

  }, {
    Raw: 'inuzumi masaki',
    Name: '戌角柾',
    Describe: '',

  }, {
    Raw: 'kurashima tomoyasu',
    Name: '仓岛丈康',
    Describe: '',

  }, {
    Raw: 'hanamo daiou',
    Name: 'はなも大王',
    Describe: '',

  }, {
    Raw: 'mizu gokiburi',
    Name: '水ゴキブリ',
    Describe: '',

  }, {
    Raw: 'kazumu',
    Name: '一梦',
    Describe: '',

  }, {
    Raw: 'rentb',
    Name: 'Rentb',
    Describe: '',

  }, {
    Raw: 'ren',
    Name: 'REN',
    Describe: '',

  }, {
    Raw: 'kotera',
    Name: 'コテラ',
    Describe: '',

  }, {
    Raw: 'fei',
    Name: '飞燕',
    Describe: '',

  }, {
    Raw: 'miyano kintarou',
    Name: '宫野金太郎',
    Describe: '',

  }, {
    Raw: 'sumino yuuji',
    Name: '速野悠二',
    Describe: '',

  }, {
    Raw: 'shouji ayumu',
    Name: '小路あゆむ',
    Describe: '',

  }, {
    Raw: 'maka fushigi',
    Name: '魔訶不思議',
    Describe: '',

  }, {
    Raw: 'draw2',
    Name: '土狼弐',
    Describe: '',

  }, {
    Raw: 'muronaga chaashuu',
    Name: '室永叉烧',
    Describe: '',

  }, {
    Raw: 'sawao',
    Name: 'さわお',
    Describe: '',

  }, {
    Raw: 'kudou hiroshi',
    Name: '工藤洋',
    Describe: '',

  }, {
    Raw: 'han',
    Name: 'HAN',
    Describe: '',

  }, {
    Raw: 'tsurui',
    Name: '鹤井',
    Describe: '',

  }, {
    Raw: 'okiraku nic',
    Name: 'お気楽ニック',
    Describe: '',

  }, {
    Raw: 'kanten',
    Name: '寒天',
    Describe: '',

  }, {
    Raw: 'usubeni sakurako',
    Name: 'うすべに桜子',
    Describe: '',

  }, {
    Raw: 'nori',
    Name: '糊',
    Describe: '',

  }, {
    Raw: 'mitsugi',
    Name: 'ミツギ',
    Describe: '',

  }, {
    Raw: 'seura isago',
    Name: '濑浦沙悟',
    Describe: '',

  }, {
    Raw: 'tsukudani norio',
    Name: '佃煮のりお',
    Describe: '',

  }, {
    Raw: 'kasugano tobari',
    Name: '春日野トバリ',
    Describe: '',

  }, {
    Raw: 'hisaka hazara',
    Name: '檜坂はざら',
    Describe: '',

  }, {
    Raw: 'sumiyao',
    Name: 'すみやお',
    Describe: '',

  }, {
    Raw: 'ikkyuu',
    Name: '一休',
    Describe: '',

  }, {
    Raw: 'hasemi ryo',
    Name: '长谷见亮',
    Describe: '',

  }, {
    Raw: 'summer',
    Name: 'サマー',
    Describe: '',

  }, {
    Raw: 'miyatsuki touka',
    Name: '都月十佳',
    Describe: '',

  }, {
    Raw: 'arigase shinji',
    Name: 'ありがせしんじ',
    Describe: '',

  }, {
    Raw: 'arisaka k',
    Name: '有坂K',
    Describe: '',

  }, {
    Raw: 'asakaze abyss',
    Name: '朝風あびす',
    Describe: '',

  }, {
    Raw: 'youki akira',
    Name: '优希辉',
    Describe: '',

  }, {
    Raw: 'matsuda k',
    Name: 'マツダK',
    Describe: '',

  }, {
    Raw: 'amanatsu aki',
    Name: '甘夏あき',
    Describe: '',

  }, {
    Raw: 'magukappu',
    Name: '马克杯',
    Describe: '',

  }, {
    Raw: 'michiyon',
    Name: 'みちよん',
    Describe: '',

  }, {
    Raw: 'hijiri tsukasa',
    Name: '圣☆司',
    Describe: '',

  }, {
    Raw: 'tsukino jyogi',
    Name: '月野定规',
    Describe: '',

  }, {
    Raw: 'gotou junji',
    Name: '后藤润二',
    Describe: '',

  }, {
    Raw: 'nogi makoto',
    Name: 'のぎまこと',
    Describe: '',

  }, {
    Raw: 'shinonome ryu',
    Name: '东云龙',
    Describe: '',

  }, {
    Raw: 'nikusyo',
    Name: '弐駆緒',
    Describe: '',

  }, {
    Raw: 'shimanto youta',
    Name: '四万十曜太',
    Describe: '',

  }, {
    Raw: 'koiou',
    Name: '鲤王',
    Describe: '',

  }, {
    Raw: 'bow rei',
    Name: '某零',
    Describe: '',

  }, {
    Raw: 'inochi wazuka',
    Name: '命わずか',
    Describe: '',

  }, {
    Raw: 'hiduki yayoi',
    Name: 'ひづき夜宵',
    Describe: '',

  }, {
    Raw: 'komori kei',
    Name: 'こもりけい',
    Describe: '',

  }, {
    Raw: 'toyama teiji',
    Name: '戸山テイジ',
    Describe: '',

  }, {
    Raw: 'komiya hitoma',
    Name: 'こみやひとま',
    Describe: '',

  }, {
    Raw: 'hitsuji takako',
    Name: 'ひつじたかこ',
    Describe: '',

  }, {
    Raw: 'mizoro tadashi',
    Name: '深泥正',
    Describe: '',

  }, {
    Raw: 'q-gaku',
    Name: 'Q-Gaku',
    Describe: '',

  }, {
    Raw: 'kemigawa mondo',
    Name: '検見川もんど',
    Describe: '',

  }, {
    Raw: 'tadano akira',
    Name: '只野あきら',
    Describe: '',

  }, {
    Raw: 'kaisen chuui',
    Name: '开栓注意',
    Describe: '',

  }, {
    Raw: 'ozy',
    Name: 'オジィ',
    Describe: '',

  }, {
    Raw: 'sakurai shizuku',
    Name: '桜井雫',
    Describe: '',

  }, {
    Raw: 'kokutou nikke',
    Name: '黒糖ニッケ',
    Describe: '',

  }, {
    Raw: 'makuwauni',
    Name: 'まくわうに',
    Describe: '',

  }, {
    Raw: 'seki',
    Name: '赤',
    Describe: '',

  }, {
    Raw: 'monorino',
    Name: 'モノリノ',
    Describe: '',

  }, {
    Raw: 'tomohiro kai',
    Name: '智弘カイ',
    Describe: '',

  }, {
    Raw: 'kuribayashi chris',
    Name: '栗林クリス',
    Describe: '',

  }, {
    Raw: 'nagai wataru',
    Name: '長井わたる',
    Describe: '',

  }, {
    Raw: 'suzuhane suzu',
    Name: 'すずはねすず',
    Describe: '',

  }, {
    Raw: 'tanaka decilitre',
    Name: '田中竕',
    Describe: '',

  }, {
    Raw: 'yahiro',
    Name: '八寻',
    Describe: '',

  }, {
    Raw: 'sabamu',
    Name: '鲭梦',
    Describe: '',

  }, {
    Raw: 'fujise akira',
    Name: '藤瀬あきら',
    Describe: '',

  }, {
    Raw: 'shouryuu',
    Name: '升龙',
    Describe: '',

  }, {
    Raw: 'kisaragi wataru',
    Name: '如月わたる',
    Describe: '',

  }, {
    Raw: 'mizone',
    Name: 'みぞね',
    Describe: '',

  }, {
    Raw: 'herokey',
    Name: 'ヒーローキィ',
    Describe: '',

  }, {
    Raw: 'mikanuji',
    Name: 'みかん氏',
    Describe: '',

  }, {
    Raw: 'honda arima',
    Name: 'ほんだありま',
    Describe: '',

  }, {
    Raw: 'oshiki hitoshi',
    Name: '御敷仁',
    Describe: '',

  }, {
    Raw: 'shimaji',
    Name: 'しまじ',
    Describe: '',

  }, {
    Raw: 'tenro aya',
    Name: '天路あや',
    Describe: '',

  }, {
    Raw: 'meme50',
    Name: 'メメ50',
    Describe: '',

  }, {
    Raw: 'menea the dog',
    Name: 'メネア・ザ・ドッグ',
    Describe: '',

  }, {
    Raw: 'makibe kataru',
    Name: '牧部かたる',
    Describe: '',

  }, {
    Raw: 'ikeshita maue',
    Name: '池下真上',
    Describe: '',

  }, {
    Raw: 'ikuhana niro',
    Name: '幾花にいろ',
    Describe: '',

  }, {
    Raw: 'c.r',
    Name: 'しーあーる',
    Describe: '',

  }, {
    Raw: 'chimosaku',
    Name: 'ちもさく',
    Describe: '',

  }, {
    Raw: 'otoo',
    Name: 'ぉとぉ',
    Describe: '',

  }, {
    Raw: 'belu',
    Name: 'BeLu',
    Describe: '',

  }, {
    Raw: 'yotsuba chika',
    Name: '四葉チカ',
    Describe: '',

  }, {
    Raw: 'hashimoto takashi',
    Name: '桥本隆',
    Describe: '桥本タカシ，日本著名原画家、画师。',

  }, {
    Raw: 'suzuhira hiro',
    Name: '铃平广',
    Describe: '原名铃木千裕， 工作职务为小说等刊物画插绘。主要作品有《银盘万花筒》插画，《空罐少女》插画，《Stellar Theater》原画担当，《命运的齿轮Wheel of Fortune》原画担当',

  }, {
    Raw: 'nishimata aoi',
    Name: '西又葵',
    Describe: '日本著名的游戏担当和漫画家。',

  }, {
    Raw: 'hadumi rio',
    Name: '羽純りお',
    Describe: '',

  }, {
    Raw: 'matsushita makako',
    Name: '松下まかこ',
    Describe: '',

  }, {
    Raw: 'sakura hanpen',
    Name: '桜はんぺん',
    Describe: '',

  }, {
    Raw: 'hatori piyoko',
    Name: '羽鳥ぴよこ',
    Describe: '',

  }, {
    Raw: 'naenae',
    Name: 'なえなえ',
    Describe: '',

  }, {
    Raw: 'takayaki',
    Name: 'たかやKi',
    Describe: '',

  }, {
    Raw: 'uonuma yuu',
    Name: 'うおぬまゆう',
    Describe: '',

  }, {
    Raw: 'amamine',
    Name: 'あまみね',
    Describe: '',

  }, {
    Raw: 'niki',
    Name: 'にき',
    Describe: '',

  }, {
    Raw: 'rokudou itsuki',
    Name: '六九導イツキ',
    Describe: '',

  }, {
    Raw: 'rubi-sama',
    Name: 'るび様',
    Describe: '',

  }, {
    Raw: 'wori',
    Name: 'ヲリ',
    Describe: '',

  }, {
    Raw: 'mura',
    Name: 'むら',
    Describe: '',

  }, {
    Raw: 'tsurusaki takahiro',
    Name: '鹤崎贵大',
    Describe: '',

  }, {
    Raw: 'fusataka sikibu',
    Name: 'ふさたか式部',
    Describe: '',

  }, {
    Raw: 'kutani',
    Name: '九手児',
    Describe: '',

  }, {
    Raw: 'takei masaki',
    Name: '竹井正树',
    Describe: '竹井正树，为日本的男性原画家、游戏设计师、插画家、动画师。MADHOUSE出身。',

  }, {
    Raw: 'yamaki rin',
    Name: '山木铃',
    Describe: '',

  }, {
    Raw: 'shokushu-san',
    Name: '触手さん',
    Describe: '',

  }, {
    Raw: 'wazakita',
    Name: 'わざきた',
    Describe: '',

  }, {
    Raw: 'erodezain koubou',
    Name: 'エロデザイン工房',
    Describe: '',

  }, {
    Raw: 'coffee-kizoku',
    Name: '珈琲貴族',
    Describe: '',

  }, {
    Raw: 'kuroi hiroki',
    Name: '黑井弘骑',
    Describe: '',

  }, {
    Raw: 'rindou',
    Name: '龙胆',
    Describe: '',

  }, {
    Raw: 'iruma kamiri',
    Name: 'いるまかみり',
    Describe: '',

  }, {
    Raw: 'zakkin',
    Name: '杂菌',
    Describe: '',

  }, {
    Raw: 'aotsu umihito',
    Name: '蒼津ウミヒト',
    Describe: '',

  }, {
    Raw: 'shiina soutyou',
    Name: '椎名总长',
    Describe: '',

  }, {
    Raw: 'hikage eiji',
    Name: '日阴影次',
    Describe: '',

  }, {
    Raw: 'amakura',
    Name: 'アマクラ',
    Describe: '',

  }, {
    Raw: 'ebi193',
    Name: 'えび193',
    Describe: '',

  }, {
    Raw: 'shinama',
    Name: 'しなま',
    Describe: '',

  }, {
    Raw: 'mars',
    Name: 'Mars',
    Describe: '',

  }, {
    Raw: 'yuran',
    Name: 'ゆらん',
    Describe: '',

  }, {
    Raw: 'toumi haruka',
    Name: '遠海ハルカ',
    Describe: '',

  }, {
    Raw: 'chris',
    Name: 'CHRIS',
    Describe: '',

  }, {
    Raw: 'mizuga',
    Name: 'みずが',
    Describe: '',

  }, {
    Raw: 'alpine',
    Name: 'あるぴーぬ',
    Describe: '',

  }, {
    Raw: 'yuuka nonoko',
    Name: '夕華ののこ',
    Describe: '',

  }, {
    Raw: 'hakuho',
    Name: '白凤',
    Describe: '',

  }, {
    Raw: 'ooshima ryou',
    Name: '大嶋亮',
    Describe: '',

  }, {
    Raw: 'aeba fuchi',
    Name: '飨庭渊',
    Describe: '',

  }, {
    Raw: 'hakka yuki',
    Name: '薄荷ゆき',
    Describe: '',

  }, {
    Raw: 'derauea',
    Name: 'でらうえあ',
    Describe: '',

  }, {
    Raw: 'rurukichi',
    Name: 'るるキチ',
    Describe: '',

  }, {
    Raw: 'unasaka',
    Name: 'うなさか',
    Describe: '',

  }, {
    Raw: 'anmi',
    Name: 'Anmi',
    Describe: '',

  }, {
    Raw: 'kishizuka kenji',
    Name: '木静谦二',
    Describe: '',

  }, {
    Raw: 'kanenomori sentarou',
    Name: '金ノ森銭太郎',
    Describe: '',

  }, {
    Raw: 'hazuki kaoru',
    Name: '八月薫',
    Describe: '',

  }, {
    Raw: 'kenzaki mikuri',
    Name: '犬崎みくり',
    Describe: '',

  }, {
    Raw: 'kofunami',
    Name: 'こふなみ',
    Describe: '',

  }, {
    Raw: 'touma itsuki',
    Name: '东磨树',
    Describe: '',

  }, {
    Raw: 'asaba yuu',
    Name: '浅葉ゆう',
    Describe: '',

  }, {
    Raw: 'akizuki ryou',
    Name: '秋月亮',
    Describe: '',

  }, {
    Raw: 'nanigawa rui',
    Name: '名仁川るい',
    Describe: '',

  }, {
    Raw: 'ohkura kazuya',
    Name: '大藏一也',
    Describe: '',

  }, {
    Raw: 'psycocko',
    Name: '碎骨子',
    Describe: '',

  }, {
    Raw: 'hanainu',
    Name: '花犬',
    Describe: '',

  }, {
    Raw: 'madoutei',
    Name: '魔童贞',
    Describe: '',

  }, {
    Raw: 'ra',
    Name: 'RA',
    Describe: '',

  }, {
    Raw: 'yohane',
    Name: 'ヨハネ',
    Describe: '',

  }, {
    Raw: 'akiduki tsukasa',
    Name: '秋月つかさ',
    Describe: '',

  }, {
    Raw: 'hanamiya natsuka',
    Name: '花宮なつか',
    Describe: '',

  }, {
    Raw: 'nagayama yuunon',
    Name: '永山ゆうのん',
    Describe: '',

  }, {
    Raw: 'sakura denbu',
    Name: '樱田麸',
    Describe: '',

  }, {
    Raw: 'sin-go',
    Name: 'Sin-Go',
    Describe: '',

  }, {
    Raw: 'tsunagami',
    Name: 'つながみ',
    Describe: '',

  }, {
    Raw: 'yassy',
    Name: 'YASSY',
    Describe: '',

  }, {
    Raw: 'rokuwata tomoe',
    Name: '六羽田トモエ',
    Describe: '',

  }, {
    Raw: 'souma',
    Name: '相马',
    Describe: '',

  }, {
    Raw: 'buguon',
    Name: '不光',
    Describe: '',

  }, {
    Raw: 'annekuma',
    Name: 'ANNEKUMA',
    Describe: '',

  }, {
    Raw: '108 gou',
    Name: '108号',
    Describe: '',

  }, {
    Raw: 'akazawa red',
    Name: 'あかざわRED',
    Describe: '',

  }, {
    Raw: 'r-koga',
    Name: 'あ～る・こが',
    Describe: '',

  }, {
    Raw: 'ashimoto yoika',
    Name: 'あしもと☆よいか',
    Describe: '',

  }, {
    Raw: 'awaji himeji',
    Name: 'あわじひめじ',
    Describe: '',

  }, {
    Raw: 'itou',
    Name: 'いトう',
    Describe: '',

  }, {
    Raw: 'usashiro mani',
    Name: 'うさ城まに',
    Describe: '',

  }, {
    Raw: 'ookami uo',
    Name: 'オオカミうお',
    Describe: '',

  }, {
    Raw: 'kawady max',
    Name: 'カワディMAX',
    Describe: '',

  }, {
    Raw: 'kimio tamako',
    Name: 'きみおたまこ',
    Describe: '',

  }, {
    Raw: 'quzilax',
    Name: 'クジラックス',
    Describe: '',

  }, {
    Raw: 'gorgeous takarada',
    Name: 'ゴージャス宝田',
    Describe: '',

  }, {
    Raw: 'zaki zaraki',
    Name: 'ザキザラキ',
    Describe: '',

  }, {
    Raw: 'tamachi yuki',
    Name: 'たまちゆき',
    Describe: '',

  }, {
    Raw: 'bar peachpit',
    Name: 'バー・ぴぃちぴっと',
    Describe: '',

  }, {
    Raw: 'higashiyama show',
    Name: '东山翔',
    Describe: '',

  }, {
    Raw: 'yoshino',
    Name: 'よしの',
    Describe: '',

  }, {
    Raw: 'minion',
    Name: 'みにおん',
    Describe: '',

  }, {
    Raw: 'nishikibasami',
    Name: '二式鋏',
    Describe: '',

  }, {
    Raw: 'onizuka naoshi',
    Name: '鬼束直',
    Describe: '',

  }, {
    Raw: 'hayashibara hikari',
    Name: '林原ひかり',
    Describe: '',

  }, {
    Raw: 'suzuki kyoutarou',
    Name: '鈴木狂太郎',
    Describe: '',

  }, {
    Raw: 'nekogen',
    Name: '猫玄',
    Describe: '',

  }, {
    Raw: 'kiya shii',
    Name: '木谷椎',
    Describe: '',

  }, {
    Raw: 'molokonomi',
    Name: '平屋のぼり',
    Describe: '',

  }, {
    Raw: 'maeshima ryou',
    Name: '前岛龙',
    Describe: '',

  }, {
    Raw: 'yamazaki kazuma',
    Name: '山崎かずま',
    Describe: '',

  }, {
    Raw: 'momonosuke',
    Name: '桃之助',
    Describe: '',

  }, {
    Raw: 'murian',
    Name: '无有利安',
    Describe: '',

  }, {
    Raw: 'samidore setsuna',
    Name: '五月雨せつな',
    Describe: '',

  }, {
    Raw: 'mutou mato',
    Name: '武藤まと',
    Describe: '',

  }, {
    Raw: 'kobayashi oukei',
    Name: '小林王桂',
    Describe: '',

  }, {
    Raw: 'tanabe kyou',
    Name: '田边京',
    Describe: '男性插图画师及漫画家。以画萝莉为主，角色多为痴女型萝莉。<br/>作者特别喜欢物语系列，特别是对小忍(oshino shinobu)特别喜欢，在P站里大量的小忍R18作品。<br/>画风随着时间不断地进步，已经形成自己独特的风格。<br/>代表作品：ぷ痴っくす<br/>![图](# "http://exhentai.org/t/56/48/56483fab132e7ac1787c38f4d9a6942ae1b7d388-327561-1057-1500-jpg_l.jpg")',
    externalLinks: '[pixiv](https://www.pixiv.net/member.php?id=8542)'
  }, {
    Raw: 'kiai neko',
    Name: '樺島あきら',
    Describe: '曾用名：きいろ猫(kiiro neko) <br/> 现用名：樺島あきら(kabashima akira)<br/>作品以露出(exhibitionism)题材为主，早期作品包含大量排便(scat)描写，重口注意！<br/>代表作品：私が変態になった理由<br/>![图](# "http://exhentai.org/t/40/d7/40d7739d91f3b1974736ec45f04c381bbef2af0a-980888-3507-2480-jpg_l.jpg")',

  }, {
    Raw: 'charu',
    Name: '茶琉',
    Describe: '露出少女遊戯/露出少女日記系列作者。<br/>代表作品：露出少女遊戯<br/>![图](# "http://exhentai.org/t/45/6e/456ec9a0d39a4b229b4f5113e08895b18c2d7c95-1122101-2150-3035-jpg_l.jpg")',
    externalLinks: '[pixiv](https://www.pixiv.net/member.php?id=125256)'
  }, {
    Raw: 'tamahagane',
    Name: 'たまはがね',
    Describe: '露出少女異譚系列画作者，萝莉露出。<br/>代表作品：露出少女異譚<br/>![图](# "http://exhentai.org/t/be/75/be75aba1508e3ec24918f8e0fccad0d937a3ac70-1758527-5636-3951-jpg_l.jpg")',
    externalLinks: '[pixiv](https://www.pixiv.net/member.php?id=1551500)'
  }, {
    Raw: 'nakani',
    Name: 'なかに',
    Describe: 'なかに【すぺ】<br/>画风独特，极具表现力。剧情发展犹如破竹。看本子笑出声系列。<br/>代表作品：まるだしすたー<br/>![图](# "http://exhentai.org/t/8f/67/8f679921298411cb837d5f75d771300f84a71e89-470051-1058-1500-jpg_l.jpg")',
    externalLinks: '[pixiv](https://www.pixiv.net/member.php?id=18899)'
  }, {
    Raw: 'mizuryu kei',
    Name: '水龙敬',
    Describe: '人类性解放的先驱者，作品多以乱交(group)为主。<br/>代表作品：おいでよ水龍敬ランド(水龙敬乐园系列)<br/>![图](# "http://exhentai.org/t/c5/a9/c5a92a74efbb2452bb88bb86d6f0ef9c091d5e83-435856-800-1119-jpg_l.jpg")',
    externalLinks: '[pixiv](https://www.pixiv.net/member.php?id=321517)'
  }, {
    Raw: 'oyari ashito',
    Name: '大枪苇人',
    Describe: '![头像](http://tva1.sinaimg.cn/crop.1.0.945.945.180/006vdozLgw1f6k9m4eu8kj30qf0qgtem.jpg)\n![图](# "http://ehgt.org/96/16/9616e663a0ab59efe63b58f1e521b180d9ddf718-1853743-2560-3627-jpg_l.jpg")![图](# "http://ehgt.org/a5/c2/a5c218921b59bda67ff863e0d34887a76f7f4e95-1042660-2103-3000-jpg_l.jpg")![图](http://ehgt.org/8b/6b/8b6b9319d4c5e05f24fc9a7ef1f067942e72f2db-1402612-1768-2500-jpg_l.jpg)![图](http://ehgt.org/b7/9a/b79a6333074400bfa77bcde9fd36d3db1eaa3f25-811640-2560-3627-jpg_l.jpg)![图](# "http://ehgt.org/a7/71/a771f39250f3f09bce382bac136e2eeb5097741a-57289-500-339-jpg_l.jpg")![图](http://ehgt.org/09/9c/099c6e952e978dd1d0b461e4973eb3782644d16b-1239240-2560-3604-jpg_l.jpg)![图](# "http://ehgt.org/3a/a4/3aa4c591e438ebfca64ac3169cbaf5e43173c2ab-2370206-3488-4800-jpg_l.jpg")![图](http://ehgt.org/5a/72/5a7205a46264facaa2a4f323bb4872162d2c2b6a-433311-1687-2400-jpg_l.jpg)![图](http://ehgt.org/c1/a2/c1a28b30d33b8bd5d825681f345086780c1a7095-1220782-3000-4250-jpg_l.jpg)',
    externalLinks: '[个人主页](https://oyariashito.net) [微博](http://weibo.com/oyariashito)'
  }, {
    Raw: 'hagiya masakage',
    Name: 'はぎやまさかげ',
    Describe: '',

  }, {
    Raw: 'siina tai',
    Name: '椎名鲷',
    Describe: '',

  }, {
    Raw: 'greenteaneko',
    Name: 'GreenTeaNeko',
    Describe: '',

  }, {
    Raw: 'akky',
    Name: 'あっきぃ☆',
    Describe: '',

  }, {
    Raw: 'kuroshiro neko',
    Name: '黑白音子',
    Describe: '',

  }, {
    Raw: 'dean',
    Name: 'ディーン',
    Describe: '',

  }, {
    Raw: 'mizutani rin',
    Name: 'みずたにりん',
    Describe: '',

  }, {
    Raw: 'ayakase chiyoko',
    Name: '綾枷ちよこ',
    Describe: '',

  }, {
    Raw: 'ayakase riberi',
    Name: '綾枷りべり',
    Describe: '',

  }, {
    Raw: 'yuasa',
    Name: 'ゆあさ',
    Describe: '',

  }, {
    Raw: 'genzaburoh',
    Name: 'Genzaburoh',
    Describe: '',

  }, {
    Raw: 'smac',
    Name: 'SMAC',
    Describe: '',

  }, {
    Raw: 'hie himiko',
    Name: '日枝御子',
    Describe: '',

  }, {
    Raw: 'hisakawa tinn',
    Name: '久川ちん',
    Describe: '',

  }, {
    Raw: 'mizuhara yuu',
    Name: '水原优',
    Describe: '',

  }, {
    Raw: 'hasumi milk',
    Name: 'はすみみるく',
    Describe: '',

  }, {
    Raw: 'karasu',
    Name: '空巢',
    Describe: '',

  }, {
    Raw: 'akiha at',
    Name: 'あきは@',
    Describe: '',

  }, {
    Raw: 'amagiri mio',
    Name: '雨雾MIO',
    Describe: '',

  }, {
    Raw: 'bifidus',
    Name: 'ビフィダス',
    Describe: '',

  }, {
    Raw: 'ice',
    Name: 'ICE',
    Describe: '',

  }, {
    Raw: 'kumoemon',
    Name: 'くもえもん',
    Describe: '',

  }, {
    Raw: 'kuro fn',
    Name: 'クロFn',
    Describe: '',

  }, {
    Raw: 'lorica',
    Name: 'Lorica',
    Describe: '',

  }, {
    Raw: 'nakayama tetsugaku',
    Name: '中山哲学',
    Describe: '',

  }, {
    Raw: 'nisepakuman-san',
    Name: '偽パクマンさん',
    Describe: '',

  }, {
    Raw: 'oobayashi mori',
    Name: '大林森',
    Describe: '',

  }, {
    Raw: 'piero',
    Name: 'PIえろ',
    Describe: '',

  }, {
    Raw: 'saida kazuaki',
    Name: 'さいだ一明',
    Describe: '',

  }, {
    Raw: 'sayryu',
    Name: '性龙',
    Describe: '',

  }, {
    Raw: 'tsukasawa',
    Name: '塚泽',
    Describe: '',

  }, {
    Raw: 'yukiguni omaru',
    Name: '雪國おまる',
    Describe: '',

  }, {
    Raw: 'asakura mitsuru',
    Name: '朝仓满',
    Describe: '',

  }, {
    Raw: 'hase tsubura',
    Name: '长谷圆',
    Describe: '',

  }, {
    Raw: 'herohero tom',
    Name: 'へろへろTom',
    Describe: '',

  }, {
    Raw: 'hoshino ryuichi',
    Name: '星野龙一',
    Describe: '',

  }, {
    Raw: 'inoue nanaki',
    Name: '井上七树',
    Describe: '',

  }, {
    Raw: 'macaroni and cheese',
    Name: 'マカロニandチーズ',
    Describe: '',

  }, {
    Raw: 'mozu k',
    Name: 'もずK',
    Describe: '',

  }, {
    Raw: 'natsuka q-ya',
    Name: '奈塚Q弥',
    Describe: '',

  }, {
    Raw: 'sakaki utamaru',
    Name: '榊歌丸',
    Describe: '',

  }, {
    Raw: 'yontarou',
    Name: 'よんたろう',
    Describe: '',

  }, {
    Raw: 'hamada yoshikadu',
    Name: '浜田よしかづ',
    Describe: '',

  }, {
    Raw: 'meowwithme',
    Name: 'MeowWithMe',
    Describe: '',

  }, {
    Raw: 'nishizaki eimu',
    Name: '西崎えいむ',
    Describe: '',

  }, {
    Raw: 'mutsumi masato',
    Name: 'むつみまさと',
    Describe: '',

  }, {
    Raw: 'samerupa',
    Name: 'さめるぱ',
    Describe: '',

  }, {
    Raw: 'yumemi',
    Name: 'ゆめみ',
    Describe: '',

  }, {
    Raw: 'watsuki ayamo',
    Name: 'わつき彩雲',
    Describe: '',

  }, {
    Raw: 'yataro',
    Name: 'やたろー',
    Describe: '',

  }, {
    Raw: 'poco',
    Name: 'ポコ',
    Describe: '',

  }, {
    Raw: 'mucha',
    Name: 'むちゃ',
    Describe: '',

  }, {
    Raw: 'fujimaru',
    Name: '藤丸',
    Describe: '',

  }, {
    Raw: 'gechu',
    Name: 'ゲッチュ',
    Describe: '',

  }, {
    Raw: 'owanta',
    Name: 'Owanta',
    Describe: '',

  }, {
    Raw: 'mikan',
    Name: 'みかん',
    Describe: '',

  }, {
    Raw: 'amanatsu mero',
    Name: '甘夏メロ',
    Describe: '',

  }, {
    Raw: 'sayika',
    Name: 'Sayika',
    Describe: '',

  }, {
    Raw: 'rihito akane',
    Name: 'りひと茜',
    Describe: '',

  }, {
    Raw: 'abe inori',
    Name: '阿部いのり',
    Describe: '',

  }, {
    Raw: 'akuochisukii sensei',
    Name: 'アクオチスキー先生',
    Describe: '',

  }, {
    Raw: 'ameyama denshin',
    Name: '雨山电信',
    Describe: '',

  }, {
    Raw: 'aoyama mayama',
    Name: '青山まやま',
    Describe: '',

  }, {
    Raw: 'bitch goigostar',
    Name: 'ビッチ☆ゴイゴスター',
    Describe: '',

  }, {
    Raw: 'danbo',
    Name: 'ダンボ',
    Describe: '',

  }, {
    Raw: 'dunga',
    Name: 'ドゥンガ',
    Describe: '',

  }, {
    Raw: 'musashi daichi',
    Name: '武蔵ダイチ',
    Describe: '',

  }, {
    Raw: 'nukunuku orange',
    Name: 'ヌクヌクオレンジ',
    Describe: '',

  }, {
    Raw: 'onikubo hirohisa',
    Name: '鬼窪浩久',
    Describe: '',

  }, {
    Raw: 'sagattoru',
    Name: 'サカッとる',
    Describe: '',

  }, {
    Raw: 'tamaki',
    Name: 'TAMAKI',
    Describe: '',

  }, {
    Raw: 'ahemaru',
    Name: 'アヘ丸',
    Describe: '',

  }, {
    Raw: 'akikusa peperon',
    Name: '秋草ぺぺろん',
    Describe: '',

  }, {
    Raw: 'dorachefu',
    Name: 'ドラチェフ',
    Describe: '',

  }, {
    Raw: 'hikage hinata',
    Name: '日陰ひなた',
    Describe: '',

  }, {
    Raw: 'kijima daisyarin',
    Name: '鬼岛大车轮',
    Describe: '',

  }, {
    Raw: 'minikoara',
    Name: '瑞稀樱花',
    Describe: '',

  }, {
    Raw: 'nanairo',
    Name: 'ナナイロ',
    Describe: '',

  }, {
    Raw: 'ryuuta',
    Name: '龙太',
    Describe: '',

  }, {
    Raw: 'shomu',
    Name: 'しょむ',
    Describe: '',

  }, {
    Raw: 'sunagawa tara',
    Name: '砂川多良',
    Describe: '',

  }, {
    Raw: 'amahara',
    Name: '天原',
    Describe: '',

  }, {
    Raw: 'arino hiroshi',
    Name: 'ありのひろし',
    Describe: '',

  }, {
    Raw: 'cheewts',
    Name: 'ちいうつ',
    Describe: '',

  }, {
    Raw: 'katsura airi',
    Name: '桂あいり',
    Describe: '',

  }, {
    Raw: 'koori',
    Name: '粉织',
    Describe: '',

  }, {
    Raw: 'red-rum',
    Name: 'RED-RUM',
    Describe: '',

  }, {
    Raw: 'ryoh-zoh',
    Name: '椋藏',
    Describe: '',

  }, {
    Raw: 'shouji nigou',
    Name: '庄司二号',
    Describe: '',

  }, {
    Raw: 'henrybird',
    Name: '半里バード9',
    Describe: '',

  }, {
    Raw: 'gui fu shen nai',
    Name: '鬼父神奈',
    Describe: '',

  }, {
    Raw: 'homing',
    Name: 'ホーミング',
    Describe: '',

  }, {
    Raw: 'kageno illyss',
    Name: '影乃いりす',
    Describe: '',

  }, {
    Raw: 'katou jun',
    Name: '加藤じゅん',
    Describe: '',

  }, {
    Raw: 'kuroda ariake',
    Name: '黑田有明',
    Describe: '',

  }, {
    Raw: 'miyabi tatsuto',
    Name: 'みやびたつと',
    Describe: '',

  }, {
    Raw: 'mizuki eimu',
    Name: 'みずきえいむ',
    Describe: '',

  }, {
    Raw: 'momon kooji',
    Name: 'ももんこーじ',
    Describe: '',

  }, {
    Raw: 'monogusa wolf',
    Name: 'ものぐさうるふ',
    Describe: '',

  }, {
    Raw: 'moroha',
    Name: '乙',
    Describe: '',

  }, {
    Raw: 'naitou satoshi',
    Name: '乃藤悟志',
    Describe: '',

  }, {
    Raw: 'oonuki makuri',
    Name: '大貫まくり',
    Describe: '',

  }, {
    Raw: 'sabashi renya',
    Name: '左橋レンヤ',
    Describe: '',

  }, {
    Raw: 't.k-1',
    Name: 'T.K-1',
    Describe: '',

  }, {
    Raw: 'tachibana surimu',
    Name: '橘すりむ',
    Describe: '',

  }, {
    Raw: 'takahashi kobato',
    Name: '高橋こばと',
    Describe: '',

  }, {
    Raw: 'takashita takashi',
    Name: 'たかしたたかし',
    Describe: '',

  }, {
    Raw: 'yokoi rego',
    Name: '横井レゴ',
    Describe: '',

  }, {
    Raw: 'amayumi',
    Name: 'あまゆみ',
    Describe: '',

  }, {
    Raw: 'ameya kirica',
    Name: 'アメヤキリカ',
    Describe: '',

  }, {
    Raw: 'arsenal',
    Name: 'アーセナル',
    Describe: '',

  }, {
    Raw: 'asagi ryu',
    Name: 'あさぎ龍',
    Describe: '',

  }, {
    Raw: 'hayano rinta',
    Name: '早野りんた',
    Describe: '',

  }, {
    Raw: 'jenigata',
    Name: 'ジェニガタ',
    Describe: '',

  }, {
    Raw: 'mita kurumi',
    Name: 'みたくるみ',
    Describe: '',

  }, {
    Raw: 'mutsuki',
    Name: '睦月',
    Describe: '',

  }, {
    Raw: 'shinobu tanei',
    Name: '志乃武丹英',
    Describe: '',

  }, {
    Raw: 'cuzukago',
    Name: 'くずかご',
    Describe: '',

  }, {
    Raw: 'kojima miu',
    Name: '儿岛未生',
    Describe: '',

  }, {
    Raw: 'kokudakaya',
    Name: 'こくだかや',
    Describe: '',

  }, {
    Raw: 'kuroishi ringo',
    Name: '黒石りんご',
    Describe: '',

  }, {
    Raw: 'mokuzou',
    Name: '杢臓',
    Describe: '',

  }, {
    Raw: 'porno studio',
    Name: 'ポルノスタディオ',
    Describe: '',

  }, {
    Raw: 'takasugi kou',
    Name: 'タカスギコウ',
    Describe: '',

  }, {
    Raw: 'uramac',
    Name: 'うらまっく',
    Describe: '',

  }, {
    Raw: 'isawa nohri',
    Name: 'いさわのーり',
    Describe: '',

  }, {
    Raw: 'kinomoto anzu',
    Name: 'きのもと杏',
    Describe: '',

  }, {
    Raw: 'misumi tsubaki',
    Name: '三澄ツバキ',
    Describe: '',

  }, {
    Raw: 'nekodanshaku',
    Name: '猫男爵',
    Describe: '',

  }, {
    Raw: 'oosawa ofuda',
    Name: '大沢おふだ',
    Describe: '',

  }, {
    Raw: 'ryoumoto hatsumi',
    Name: '岭本八美',
    Describe: '',

  }, {
    Raw: 'sabaku chitai',
    Name: '沙漠地带',
    Describe: '',

  }, {
    Raw: 'salad',
    Name: 'さらだ',
    Describe: '',

  }, {
    Raw: 'sawayaka samehada',
    Name: 'さわやか鮫肌',
    Describe: '',

  }, {
    Raw: 'ueda yuu',
    Name: '上田裕',
    Describe: '',

  }, {
    Raw: 'usakun',
    Name: 'うさくん',
    Describe: '',

  }, {
    Raw: 'chiguchi miri',
    Name: 'チグチミリ',
    Describe: '',

  }, {
    Raw: 'fuyuno mikan',
    Name: '冬野みかん',
    Describe: '',

  }, {
    Raw: 'hikoma hiroyuki',
    Name: '彦馬ヒロユキ',
    Describe: '',

  }, {
    Raw: 'imotoka tsuyuki',
    Name: '芋とか露木',
    Describe: '',

  }, {
    Raw: 'natsuki kiyohito',
    Name: '夏木きよひと',
    Describe: '',

  }, {
    Raw: 'noise',
    Name: 'Noise',
    Describe: '',

  }, {
    Raw: 'nukkoru',
    Name: 'ぬっこる',
    Describe: '',

  }, {
    Raw: 'ponsuke',
    Name: 'ポンスケ',
    Describe: '',

  }, {
    Raw: 'satuyo',
    Name: 'さつよ',
    Describe: '',

  }, {
    Raw: 'soine',
    Name: '添い寝',
    Describe: '',

  }, {
    Raw: 'takaoka motofumi',
    Name: '高冈基文',
    Describe: '',

  }, {
    Raw: 'sink',
    Name: 'SINK',
    Describe: '',

  }, {
    Raw: 'warabino matsuri',
    Name: '蕨野まつり',
    Describe: '',

  }, {
    Raw: 'nandz',
    Name: 'NandZ',
    Describe: '',

  }, {
    Raw: 'urakan',
    Name: 'U罗汉',
    Describe: '',

  }, {
    Raw: 'shiwasu horio',
    Name: '師走ほりお',
    Describe: '',

  }, {
    Raw: 'pokachu',
    Name: 'ぽかちゅ',
    Describe: '',

  }, {
    Raw: 'wasabi',
    Name: 'わさび | 和錆',
    Describe: '',

  }, {
    Raw: 'naruko hanaharu',
    Name: '鸣子花春',
    Describe: '鸣子ハナハル（鸣子花春）是日本的漫画家 男性。2002年出刊的《COMIC快楽天》(ワニマガジン社)刊登的《ヒタイ》出道。以后ワニマガジン社成人漫画杂志为活动中心为定期出刊的《COMIC快楽天》的封面负责。2005年则担当Mediamix作品《かみちゅ!!》（神是中学生）漫画版的作画。',

  }, {
    Raw: 'bosshi',
    Name: 'ぼっしぃ',
    Describe: '代表作：扶她部(ふた部)<br/>![图](# "http://exhentai.org/t/86/13/861361f96cb61f8bdf1933ed548bdb25f0a37d51-105241-600-800-jpg_l.jpg")',

  }, {
    Raw: 'inu',
    Name: '犬',
    Describe: '代表作：初犬系列<br/>![图](# "http://exhentai.org/t/25/55/2555c451ca321380282e7f9917dcf262c65c28bb-745866-1369-1200-jpg_l.jpg")',

  }, {
    Raw: 'takeda hiromitsu',
    Name: '武田弘光',
    Describe: '![图](# "http://exhentai.org/t/80/c9/80c97d34bcf531019ac41d767d77378f913d3036-881347-1142-1600-jpg_l.jpg")',

  }, {
    Raw: 'shiwasu no okina',
    Name: '師走の翁',
    Describe: '作品多以大乱交为主。<br/>代表作：アイブカ[仮]<br/>![图](# "http://exhentai.org/t/9e/fb/9efb90bd585a92e8dbc49e8ad9d07e5b940fcb39-1369366-2161-3000-jpg_l.jpg")',

  }, {
    Raw: 'shindol',
    Name: '新堂エル',
    Describe: '被誉为“里界白求恩”，美国人。<br/>代表作：TSF物語<br/>![图](# "http://exhentai.org/t/7f/9e/7f9e010977d468bc42d4cade8f675d74c4a21a6b-1312554-3711-1600-jpg_l.jpg")',

  }, {
    Raw: 'otono natsu',
    Name: '音乃夏',
    Describe: '代表作：女子高生の腰つき<br/>![图](# "http://exhentai.org/t/41/0b/410bbcb6fd7331fb44b8c7a1b60fcd92a5de01d4-1479001-3632-1600-jpg_l.jpg")',

  }, {
    Raw: 'yasui riosuke',
    Name: 'ヤスイリオスケ',
    Describe: '![图](# "http://exhentai.org/t/0b/04/0b0465ba83727f5201ae69690f8a40f8e08afc2c-820428-2166-3036-jpg_l.jpg")',

  }, {
    Raw: 'kizuki aruchu',
    Name: '鬼月あるちゅ',
    Describe: '![图](# "http://exhentai.org/t/9a/43/9a436588bfa3aca44dc4f5a626e606fe87e1287e-1769126-1431-2000-jpg_l.jpg")',

  }, {
    Raw: 'sameda koban',
    Name: 'さめだ小判',
    Describe: '![图](# "http://exhentai.org/t/70/0c/700ceea64809d415bcb38aefb797badb6ec44c67-417153-700-889-jpg_l.jpg")',

  }, {
    Raw: 'koume keito',
    Name: '小梅けいと',
    Describe: '花粉少女 <br/>![图](# "http://exhentai.org/t/29/ae/29ae6af2879a51570ea087472403d2014569d97f-1201347-1082-1536-jpg_l.jpg")',

  }, {
    Raw: 'thomas',
    Name: '藤ます',
    Describe: '![图](# "http://exhentai.org/t/61/4f/614f068b36fac77e7acc247c1548d0d291d821cc-91019-800-1122-jpg_l.jpg")',

  }, {
    Raw: 'mutsutake',
    Name: '睦茸',
    Describe: '![图](# "http://exhentai.org/t/28/00/28008f3ff4a7bc04e6e9244fb58bd4c14c77985b-708592-1184-1650-jpg_l.jpg")',

  }, {
    Raw: 'midori no rupe',
    Name: '緑のルーペ',
    Describe: '![图](# "http://exhentai.org/t/bc/47/bc4703c0ee848bdfe1520e586ea86bc244e6a429-1428388-2560-3579-jpg_l.jpg")',

  }, {
    Raw: 'homunculus',
    Name: 'ホムンクルス',
    Describe: '![图](# "http://exhentai.org/t/e7/9f/e79f759a10822fcd842ab547708680843ac44f93-1750532-3048-4217-jpg_l.jpg")',

  }, {
    Raw: 'lunch',
    Name: 'らんち',
    Describe: '![图](# "http://exhentai.org/t/04/f5/04f527a5b265174a654c2d24ae0bd9dfc26d18ca-2100668-4674-2000-jpg_l.jpg")',

  }, {
    Raw: 'inoue kiyoshirou',
    Name: '胃之上奇嘉郎',
    Describe: '![图](# "http://exhentai.org/t/ee/06/ee0694425a7a5274df8f7d54e221c0a545a0e9b9-1644020-2120-3000-jpg_l.jpg")',

  }, {
    Raw: 'namonashi',
    Name: '无望菜志',
    Describe: '![图](# "http://ehgt.org/da/44/da44e3cbdaa00f8244ae7cb01a166ae62915d9ac-8165851-4230-6030-jpg_l.jpg")',

  }, {
    Raw: 'oda non',
    Name: '织田non',
    Describe: '画风写实，多为熟女(milf)<br/>',

  }, {
    Raw: 'nemunemu',
    Name: 'ネムネム',
    Describe: '老师画的男孩子太棒了！画的比女孩子还要美的身材。',

  }, {
    Raw: 'makita masaki',
    Name: '蒔田真記',
    Describe: '日本女性插画师，主要从事成人插画作品。',

  }, {
    Raw: 'hoshiai hiro',
    Name: '星逢ひろ',
    Describe: '日本成人漫画家。最初以男性向种类活动。2000年以后，将创作重心移向正太(shotacon)和男同(yaoi)。其作品故事情节细腻，在H中仍能体会到一些感动。',

  }, {
    Raw: 'takase yuu',
    Name: '鹰势优',
    Describe: '90年代中期开始从事成人向漫画创作。作品以萝莉(lolicon)和正太(shotacon)为主。',

  }, {
    Raw: 'hiiragi masaki',
    Name: '柊柾葵',
    Describe: '2004年以作品『クーロ君の華麗なる日常』（ショタみみLOVE vol.6）出道。之后以『クーロ君シリーズ』（即少年男仆库洛）系列在合集杂志进行创作。',

  }, {
    Raw: 'po-ju',
    Name: 'ぽ～じゅ',
    Describe: '插画师。作品以正太(shotacon)为主。画风细腻色情。',
    externalLinks: '[pixiv](https://www.pixiv.net/member.php?id=19291)'
  }, {
    Raw: 'abu hyaku',
    Name: 'あぶひゃく',
    Describe: '男孩子的慰菊入门的作者。',

  }, {
    Raw: 'suehirogari',
    Name: 'すえひろがり',
    Describe: '![图](# "http://exhentai.org/t/21/63/216303dc5c19009d310064d3ba1006cbf8976947-517308-1750-2454-jpg_l.jpg")',

  }, {
    Raw: 'shiromaneki',
    Name: 'シオマネキ',
    Describe: '![图](# "http://exhentai.org/t/45/ae/45aeec2a06bdfbb63f2968e20759974998b3b3ee-1277202-3560-1584-jpg_l.jpg")',

  }, {
    Raw: 'chimee house',
    Name: 'ちみはうす',
    Describe: '![图](# "http://exhentai.org/t/31/3d/313de88039a4a01f28163a988fc88620e3818b5c-618153-2150-3036-jpg_l.jpg")',

  }, {
    Raw: 'kuritsu yoshihiro',
    Name: 'くりつよしひろ',
    Describe: '![图](# "http://exhentai.org/t/13/cd/13cd290c30b3427e65f66259060b33dfbfed3d81-912091-1981-2400-jpg_l.jpg")',

  }, {
    Raw: 'guglielmo',
    Name: 'ぐりえるも',
    Describe: '![图](# "http://exhentai.org/t/ed/90/ed9067c2d3f2e5292d02b4ea4bc20bca6af46163-4749231-1761-2500-png_l.jpg") <br/> ![图](# "http://exhentai.org/t/07/06/0706ebc73f5479bc16146287c5281e971c4500d0-752895-2097-3009-jpg_l.jpg")',

  }, {
    Raw: 'kusano yuu',
    Name: '草野ゆぅ',
    Describe: '![图](# "http://exhentai.org/t/84/a2/84a2a65577b300681aad16d2e19633488604cb3c-2300734-2280-3280-jpg_l.jpg")',

  }, {
    Raw: 'matsuno susumu',
    Name: '松野すすむ',
    Describe: '![图](# "http://exhentai.org/t/c0/39/c0391931aae172d7656c0f6b667541d8c294dde7-1640079-1512-2102-jpg_l.jpg")',

  }, {
    Raw: 'murasaki syu',
    Name: 'むらさき朱',
    Describe: '![图](# "http://exhentai.org/t/91/79/9179053a45f40dea3baa9fc5efbc98ecb948673e-865494-1024-1492-jpg_l.jpg")',

  }, {
    Raw: 'nishi iori',
    Name: '西安',
    Describe: '![图](# "http://exhentai.org/t/2c/32/2c323417c8780fe37544b72c48baa9a0bb12326d-3885059-2071-3000-jpg_l.jpg")',

  }, {
    Raw: 'ohara tometa',
    Name: '小原トメ太',
    Describe: '',

  }, {
    Raw: 'sakura koharu',
    Name: 'さくら小春',
    Describe: '',

  }, {
    Raw: 'junkos',
    Name: '淳子',
    Describe: '',

  }, {
    Raw: 'hoshino lily',
    Name: '星野リリィ',
    Describe: '',

  }, {
    Raw: 'heriyama',
    Name: '缘山',
    Describe: '',

  }, {
    Raw: 'nasuyama',
    Name: '茄子山',
    Describe: '',

  }, {
    Raw: 'misasagi task',
    Name: '陵たすく',
    Describe: '',

  }, {
    Raw: 'oyu no kaori',
    Name: 'お湯の香り',
    Describe: '',

  }, {
    Raw: 'kojima saya',
    Name: '小岛纱',
    Describe: '',

  }, {
    Raw: 'mitsuki sakura',
    Name: '美月樱',
    Describe: '',

  }, {
    Raw: 'tmzf',
    Name: 'TMZF',
    Describe: '',

  }, {
    Raw: 'kamikaze makoto',
    Name: '神风诚',
    Describe: '',

  }, {
    Raw: 'saikawa akoya',
    Name: '斎川あこや',
    Describe: '',

  }, {
    Raw: 'saikawa yusa',
    Name: 'さいかわゆさ',
    Describe: '',

  }, {
    Raw: 'kita kaduki',
    Name: '北かづき',
    Describe: '',

  }, {
    Raw: 'mach ii',
    Name: 'まぁくII',
    Describe: '',

  }, {
    Raw: 'tatsunami youtoku',
    Name: '辰波要徳',
    Describe: '',

  }, {
    Raw: 'tinkle',
    Name: 'てぃんくる',
    Describe: '',

  }, {
    Raw: 'kiriyama',
    Name: '桐山',
    Describe: '',

  }, {
    Raw: 'takatsu',
    Name: '高津',
    Describe: '',

  }, {
    Raw: 'gekkoji',
    Name: '激昂寺',
    Describe: '',

  }, {
    Raw: 'monety',
    Name: 'もねてぃ',
    Describe: '',

  }, {
    Raw: 'hyji',
    Name: '灰司',
    Describe: '',

  }, {
    Raw: 'rokuichi',
    Name: '六壹',
    Describe: '',

  }, {
    Raw: 'yakumi benishouga',
    Name: '药味红生姜',
    Describe: '',

  }, {
    Raw: 'takeyuu',
    Name: 'タケユウ',
    Describe: '',

  }, {
    Raw: 'pokka',
    Name: 'ぽっか',
    Describe: '',

  }, {
    Raw: 'hiroshiki',
    Name: '宏式',
    Describe: '',

  }, {
    Raw: 'tonda',
    Name: 'Tonda',
    Describe: '',

  }, {
    Raw: 'matsu takeshi',
    Name: '松武',
    Describe: '',

  }, {
    Raw: 'matsuzaki tsukasa',
    Name: '松崎司',
    Describe: '',

  }, {
    Raw: 'zood',
    Name: 'ZOOD',
    Describe: '',

  }, {
    Raw: 'redlight',
    Name: 'REDLIGHT',
    Describe: '',

  }, {
    Raw: 'yukie',
    Name: 'ゆき恵',
    Describe: '',

  }, {
    Raw: 'raven',
    Name: 'RAVEN',
    Describe: '',

  }, {
    Raw: 'sujoyushi',
    Name: '酢醤油氏',
    Describe: '',

  }, {
    Raw: 'date',
    Name: 'DATE',
    Describe: '',

  }, {
    Raw: 'kase daiki',
    Name: '加濑大辉',
    Describe: '',

  }, {
    Raw: 'uraho an',
    Name: '浦歩あん',
    Describe: '',

  }, {
    Raw: 'nakamura kumarin',
    Name: '中村くまりん',
    Describe: '',

  }, {
    Raw: 'masago',
    Name: 'まさご',
    Describe: '',

  }, {
    Raw: 'ron',
    Name: 'RON',
    Describe: '',

  }, {
    Raw: 'zounose',
    Name: 'ゾウノセ',
    Describe: '',

  }, {
    Raw: 'suzuka sakito',
    Name: '凉加早希兔',
    Describe: '',

  }, {
    Raw: 'sugi g',
    Name: 'すぎぢー',
    Describe: '',

  }, {
    Raw: 'kanzaki maguro',
    Name: '潤咲まぐろ',
    Describe: '',

  }, {
    Raw: 'sakagaki',
    Name: 'サカガキ',
    Describe: '',

  }, {
    Raw: 'ohmiya tsukasa',
    Name: '大宫司',
    Describe: '',

  }, {
    Raw: 'leslie bRawn',
    Name: 'Leslie BRawn',
    Describe: '',

  }, {
    Raw: 'satsuki imonet',
    Name: '皋月芋网',
    Describe: '',

  }, {
    Raw: 'chiyoko',
    Name: 'ちよこ',
    Describe: '',

  }, {
    Raw: 'marui maru',
    Name: '丸居まる',
    Describe: '',

  }, {
    Raw: 'asuhiro',
    Name: 'アスヒロ',
    Describe: '',

  }, {
    Raw: 'bomb',
    Name: 'ボム',
    Describe: '',

  }, {
    Raw: 'buta tamako',
    Name: '豚たま子',
    Describe: '',

  }, {
    Raw: 'eguchi jaws',
    Name: '江口ジョーズ',
    Describe: '',

  }, {
    Raw: 'eno yukimi',
    Name: '榎ゆきみ',
    Describe: '',

  }, {
    Raw: 'esuke',
    Name: 'えーすけ',
    Describe: '',

  }, {
    Raw: 'gintarou',
    Name: 'ぎん太郎',
    Describe: '',

  }, {
    Raw: 'hardboiled yoshiko',
    Name: 'ハードボイルドよし子',
    Describe: '',

  }, {
    Raw: 'hinahara emi',
    Name: '雛原えみ',
    Describe: '',

  }, {
    Raw: 'hitori',
    Name: '火鸟',
    Describe: '',

  }, {
    Raw: 'karasuma yayoi',
    Name: '烏丸やよい',
    Describe: '',

  }, {
    Raw: 'napata',
    Name: 'なぱた',
    Describe: '',

  }, {
    Raw: 'nokin',
    Name: 'のきん',
    Describe: '',

  }, {
    Raw: 'savan',
    Name: 'SAVAN',
    Describe: '',

  }, {
    Raw: 'sugaishi',
    Name: 'すがいし',
    Describe: '',

  }, {
    Raw: 'sumiya',
    Name: 'スミヤ',
    Describe: '',

  }, {
    Raw: 'takashi',
    Name: 'タカシ',
    Describe: '',

  }, {
    Raw: 'umakuchi shouyu',
    Name: 'うまくち醤油',
    Describe: '',

  }, {
    Raw: 'ushino kandume',
    Name: '牛野缶诘',
    Describe: '',

  }, {
    Raw: 'yahiro pochi',
    Name: '八尋ぽち',
    Describe: '',

  }, {
    Raw: 'yanyo',
    Name: 'やんよ',
    Describe: '',

  }, {
    Raw: 'yuzuha',
    Name: 'ユズハ',
    Describe: '',

  }, {
    Raw: 'yamagara tasuku',
    Name: '山雀たすく',
    Describe: '',

  }, {
    Raw: 'zumikuni',
    Name: 'ズミクニ',
    Describe: '',

  }, {
    Raw: 'juder',
    Name: 'Juder',
    Describe: '',

  }, {
    Raw: 'nagase yutaka',
    Name: '長瀬ゆたか',
    Describe: '',

  }, {
    Raw: 'yumeno owari',
    Name: 'ユメのオワリ',
    Describe: '',

  }, {
    Raw: 'jinguu kozue',
    Name: '神宫梢',
    Describe: '',

  }, {
    Raw: 'anzu',
    Name: '庵ズ',
    Describe: '',

  }, {
    Raw: 'lu renbing',
    Name: '路人丙',
    Describe: '',

  }, {
    Raw: 'takei ooki',
    Name: 'タケイオーキ',
    Describe: '',

  }, {
    Raw: 'azuma tesshin',
    Name: '东铁神',
    Describe: '',

  }, {
    Raw: 'akagi asahito',
    Name: '赤城あさひと',
    Describe: '',

  }, {
    Raw: 'benimura karu',
    Name: '紅村かる',
    Describe: '',

  }, {
    Raw: 'bota mochito',
    Name: '牡丹もちと',
    Describe: '',

  }, {
    Raw: 'cuvie',
    Name: 'Cuvie',
    Describe: '',

  }, {
    Raw: 'hazuki yuto',
    Name: '羽月ユウト',
    Describe: '',

  }, {
    Raw: 'hinasaki yo',
    Name: '雏咲叶',
    Describe: '',

  }, {
    Raw: 'hirama hirokazu',
    Name: '平間ひろかず',
    Describe: '',

  }, {
    Raw: 'hishigata tomaru',
    Name: 'ひし形とまる',
    Describe: '',

  }, {
    Raw: 'ichiko',
    Name: 'いちこ',
    Describe: '',

  }, {
    Raw: 'mokufu',
    Name: 'もくふう',
    Describe: '',

  }, {
    Raw: 'okumoto yuuta',
    Name: 'オクモト悠太',
    Describe: '',

  }, {
    Raw: 'regdic',
    Name: 'れぐでく',
    Describe: '',

  }, {
    Raw: 'shiba nanasei',
    Name: '柴七世',
    Describe: '',

  }, {
    Raw: 'shimetta seiya',
    Name: '湿った星夜',
    Describe: '',

  }, {
    Raw: 'tsukitokage',
    Name: '月蜥蜴',
    Describe: '',

  }, {
    Raw: 'izumi yuhina',
    Name: 'いずみゆひな',
    Describe: '',

  }, {
    Raw: 'ryouma',
    Name: 'りょうま',
    Describe: '',

  }, {
    Raw: 'akino sora',
    Name: 'あきのそら',
    Describe: '',

  }, {
    Raw: 'yumeno tanuki',
    Name: '梦乃狸',
    Describe: '',

  }, {
    Raw: 'ichinomiya',
    Name: '一ノ宮',
    Describe: '',

  }, {
    Raw: 'kikuchi seiji',
    Name: '菊池政治',
    Describe: '',

  }, {
    Raw: 'yabuki gou',
    Name: '矢吹豪',
    Describe: '',

  }, {
    Raw: 'sanbun kyoden',
    Name: '山文京传',
    Describe: '',

  }, {
    Raw: 'takunomi',
    Name: 'たくのみ',
    Describe: '',

  }, {
    Raw: '1-gou',
    Name: '1号',
    Describe: '',

  }, {
    Raw: 'kadoi aya',
    Name: '门井亚矢',
    Describe: '',

  }, {
    Raw: 'doumeki bararou',
    Name: '百目鬼蔷薇郎',
    Describe: '',

  }, {
    Raw: 'umiushi',
    Name: 'うみうし',
    Describe: '',

  }, {
    Raw: 'samidare setsuna',
    Name: '五月雨せつな',
    Describe: '',

  }, {
    Raw: 'flo',
    Name: 'FLO',
    Describe: '',

  }, {
    Raw: 'shinobe',
    Name: 'しのべ',
    Describe: '',

  }, {
    Raw: 'kamiya',
    Name: 'Kamiya | かみや',
    Describe: '臨時PT\nEXPOT',

  }, {
    Raw: 'aduma ren',
    Name: 'あづま煉',
    Describe: '',

  }, {
    Raw: 'akiya akira',
    Name: '秋谷昭',
    Describe: '',

  }, {
    Raw: 'ashiomi masato',
    Name: 'アシオミマサト',
    Describe: '',

  }, {
    Raw: 'hamao',
    Name: 'Hamao',
    Describe: '',

  }, {
    Raw: 'hyocorou',
    Name: 'ひょころー',
    Describe: '',

  }, {
    Raw: 'ichimatsu',
    Name: 'いちまつ',
    Describe: '',

  }, {
    Raw: 'ishikawa shisuke',
    Name: '石川シスケ',
    Describe: '',

  }, {
    Raw: 'itou ei',
    Name: 'いとうえい',
    Describe: '',

  }, {
    Raw: 'karma tatsurou',
    Name: 'かるま龍狼',
    Describe: '',

  }, {
    Raw: 'kizuka kazuki',
    Name: 'きづかかずき',
    Describe: '',

  }, {
    Raw: 'koppori nama beer',
    Name: 'こっぽり生ビール',
    Describe: '',

  }, {
    Raw: 'linda',
    Name: 'LINDA',
    Describe: '',

  }, {
    Raw: 'mojarin',
    Name: 'もじゃりん',
    Describe: '',

  }, {
    Raw: 'momoko',
    Name: 'ももこ',
    Describe: '',

  }, {
    Raw: 'netoromorikon',
    Name: 'ねとろもりこん',
    Describe: '',

  }, {
    Raw: 'okara',
    Name: 'おから',
    Describe: '',

  }, {
    Raw: 'reco',
    Name: 'Reco',
    Describe: '',

  }, {
    Raw: 'zanzi',
    Name: '暂时',
    Describe: '',

  }, {
    Raw: 'hozumi kenji',
    Name: 'ほずみけんじ',
    Describe: '',

  }, {
    Raw: 'mel',
    Name: 'Mel',
    Describe: '',

  }, {
    Raw: 'getty',
    Name: 'Getty',
    Describe: '',

  }, {
    Raw: 'ramjak',
    Name: 'Ramjak',
    Describe: '',

  }, {
    Raw: 'the jinshan',
    Name: 'The Jinshan',
    Describe: '',

  }, {
    Raw: 'yu-ta',
    Name: 'YU-TA',
    Describe: '',

  }, {
    Raw: 'ooba nii',
    Name: '大庭新',
    Describe: '',

  }, {
    Raw: 'yuuki sei',
    Name: '结城成',
    Describe: '',

  }, {
    Raw: 'natsume eri',
    Name: 'なつめえり',
    Describe: '',

  }, {
    Raw: 'kuroinu juu',
    Name: '黑犬兽',
    Describe: '',

  }, {
    Raw: 'bakutaso',
    Name: '爆タソ',
    Describe: '',

  }, {
    Raw: 'mda starou',
    Name: 'MだSたろう',
    Describe: '',

  }, {
    Raw: 'tsuchigayu',
    Name: '土粥',
    Describe: '',
    externalLinks: '[pixiv](https://www.pixiv.net/member.php?id=4700924)'
  }, {
    Raw: 'myu-po',
    Name: 'myu-po',
    Describe: '',
    externalLinks: '[pixiv](https://www.pixiv.net/member.php?id=172800)'
  }, {
    Raw: 'nase',
    Name: '名濑',
    Describe: '',

  }, {
    Raw: 'noba',
    Name: 'の歯',
    Describe: '',

  }, {
    Raw: 'shiki takuto',
    Name: '史鬼匠人',
    Describe: '',

  }, {
    Raw: 'sakagami umi',
    Name: '坂上海',
    Describe: '',

  }, {
    Raw: 'kuno touya',
    Name: '九野十弥',
    Describe: '',

  }, {
    Raw: 'sakurasawa yukino',
    Name: 'さくらさわゆきの',
    Describe: '',

  }, {
    Raw: 'inomoto rikako',
    Name: '井ノ本リカ子',
    Describe: '',

  }, {
    Raw: 'mikemono yuu',
    Name: '神毛物由宇',
    Describe: '',

  }, {
    Raw: 'tsukioka kirio',
    Name: 'ツキオカキリオ',
    Describe: '',

  }, {
    Raw: 'nishi',
    Name: '弐肆 | にし | 西',
    Describe: 'Count2.4\nLily | Studio Empty\n风来人',

  }, {
    Raw: 'chachaki noriyuki',
    Name: '清山昌',
    Describe: '',

  }, {
    Raw: 'abe morioka',
    Name: 'あべもりおか',
    Describe: '',

  }, {
    Raw: 'akishima shun',
    Name: '昭嶋しゅん',
    Describe: '',

  }, {
    Raw: 'alexi laiho',
    Name: '荒岸来步',
    Describe: '',

  }, {
    Raw: 'dobato',
    Name: 'ドバト',
    Describe: '',

  }, {
    Raw: 'fuyu mikan',
    Name: '冬みかん',
    Describe: '',

  }, {
    Raw: 'hatch',
    Name: 'ハッチ',
    Describe: '',

  }, {
    Raw: 'inoue yoshihisa',
    Name: '井上よしひさ',
    Describe: '',

  }, {
    Raw: 'ken',
    Name: 'KEN | けん',
    Describe: 'INSERT\nF/T',

  }, {
    Raw: 'kimura neito',
    Name: '木村宁都',
    Describe: '',

  }, {
    Raw: 'kir-rin',
    Name: 'きりりん',
    Describe: '',

  }, {
    Raw: 'ootori ryuuji',
    Name: 'おおとりりゅうじ',
    Describe: '',

  }, {
    Raw: 'suzunone kanata',
    Name: '音々かなた',
    Describe: '',

  }, {
    Raw: 'terada nuki',
    Name: '寺田ぬき',
    Describe: '',

  }, {
    Raw: 'wakana hanabi',
    Name: 'わかなはなび',
    Describe: '',

  }, {
    Raw: 'amecha',
    Name: 'アメちゃ',
    Describe: '',

  }, {
    Raw: 'tamano nae',
    Name: '珠乃なえ',
    Describe: '',

  }, {
    Raw: 'caviar',
    Name: 'きゃびあ',
    Describe: '',

  }, {
    Raw: 'mojyako',
    Name: 'モジャコ',
    Describe: '',

  }, {
    Raw: 'hammer',
    Name: 'ハマー',
    Describe: '',

  }, {
    Raw: 'ruku',
    Name: 'るく',
    Describe: '',

  }, {
    Raw: 'sugiyuu',
    Name: 'スギユウ',
    Describe: '',

  }, {
    Raw: 'wox yang',
    Name: '沃克羊',
    Describe: '',

  }, {
    Raw: 'garland',
    Name: 'があらんど',
    Describe: '',

  }, {
    Raw: 'homare',
    Name: 'ほまれ | 誉',
    Describe: '鈴の丘\nFOOL\'s ART GALLERY',

  }, {
    Raw: 'amadume ryuuta',
    Name: '甘诘留太（A・浪漫・我慢）',
    Describe: '',

  }, {
    Raw: 'blade',
    Name: 'BLADE',
    Describe: '',

  }, {
    Raw: 'itou seto',
    Name: 'イトウせと',
    Describe: '',

  }, {
    Raw: 'tanno ran',
    Name: 'タンノらん',
    Describe: '',

  }, {
    Raw: 'junk kameyoko',
    Name: 'JUNK龟横',
    Describe: '',

  }, {
    Raw: 'mizutenka',
    Name: '水点下',
    Describe: '',

  }, {
    Raw: 'maro',
    Name: 'MARO',
    Describe: '',

  }, {
    Raw: 'eb110ss',
    Name: 'EB110SS',
    Describe: '',

  }, {
    Raw: 'equal',
    Name: 'イコール',
    Describe: '',

  }, {
    Raw: 'hippopotamus',
    Name: 'ひぽぽたます',
    Describe: '',

  }, {
    Raw: 'mikan r',
    Name: 'みかんR',
    Describe: '',

  }, {
    Raw: 'sanezaki tsukiuo',
    Name: '志崎月鱼',
    Describe: '',

  }, {
    Raw: 'wang-pac',
    Name: 'わんぱく',
    Describe: '',

  }, {
    Raw: 'arai taiki',
    Name: '新井大器',
    Describe: '',

  }, {
    Raw: 'ari',
    Name: 'あり',
    Describe: '',

  }, {
    Raw: 'ayano rena',
    Name: '綾乃れな',
    Describe: '',

  }, {
    Raw: 'chuunen',
    Name: '中年',
    Describe: '',

  }, {
    Raw: 'hanafuda sakurano',
    Name: '花札さくらの',
    Describe: '',

  }, {
    Raw: 'kaponco taroh',
    Name: 'かぽんこたろう',
    Describe: '',

  }, {
    Raw: 'lockheart',
    Name: 'ロックハート',
    Describe: '',

  }, {
    Raw: 'nasipasuta',
    Name: 'なしぱすた',
    Describe: '',

  }, {
    Raw: 'poccora',
    Name: 'ぽっこら',
    Describe: '',

  }, {
    Raw: 'puyocha',
    Name: 'ぷよちゃ',
    Describe: '',

  }, {
    Raw: 'rakujin',
    Name: 'らくじん',
    Describe: '',

  }, {
    Raw: 'syuuen',
    Name: '终焉',
    Describe: '',

  }, {
    Raw: 'harazaki takuma',
    Name: 'はらざきたくま',
    Describe: '',

  }, {
    Raw: 'hashimura aoki',
    Name: '桥村青树',
    Describe: '',

  }, {
    Raw: 'malcorond',
    Name: 'まるころんど',
    Describe: '',

  }, {
    Raw: 'marugari santarou',
    Name: '丸刈参太郎',
    Describe: '',

  }, {
    Raw: 'poncocchan',
    Name: 'ぽんこっちゃん',
    Describe: '',

  }, {
    Raw: 'tetsuna',
    Name: 'テツナ',
    Describe: '',

  }, {
    Raw: 'kazan no you',
    Name: '火山の楊',
    Describe: '',

  }, {
    Raw: 'mtu',
    Name: 'MtU',
    Describe: '',

  }, {
    Raw: 'alp',
    Name: 'あるぷ',
    Describe: '',

  }, {
    Raw: 'chiba toshirou',
    Name: 'チバトシロウ',
    Describe: '',

  }, {
    Raw: 'choco pahe',
    Name: 'チョコぱへ',
    Describe: '',

  }, {
    Raw: 'hal',
    Name: 'HAL',
    Describe: '',

  }, {
    Raw: 'harukichi',
    Name: 'はるきち',
    Describe: '',

  }, {
    Raw: 'ichinomiya yuu',
    Name: '一宫夕羽',
    Describe: '',

  }, {
    Raw: 'inago',
    Name: 'INAGO',
    Describe: '',

  }, {
    Raw: 'maki daikichi',
    Name: '牧だいきち',
    Describe: '',

  }, {
    Raw: 'raita',
    Name: 'RAITA | 来太',
    Describe: '',

  }, {
    Raw: 'sasachinn',
    Name: 'ささちん',
    Describe: '',

  }, {
    Raw: 'soushamoku',
    Name: '桑柘木',
    Describe: '',

  }, {
    Raw: 'suzuki akoni',
    Name: '鈴月あこに',
    Describe: '',

  }, {
    Raw: 'tachibana yuu',
    Name: '橘由宇',
    Describe: '',

  }, {
    Raw: 'takeda aranobu',
    Name: '武田あらのぶ',
    Describe: '',

  }, {
    Raw: 'jinnai',
    Name: 'ジンナイ',
    Describe: '',

  }, {
    Raw: 'dhibi',
    Name: 'ディビ',
    Describe: '',

  }, {
    Raw: 'fuuga',
    Name: '枫牙',
    Describe: '',

  }, {
    Raw: 'yoshimura tatsumaki',
    Name: '吉村龙卷',
    Describe: '',

  }, {
    Raw: 'hinokawa jun',
    Name: '火の川純',
    Describe: '',

  }, {
    Raw: 'womi',
    Name: 'WOMI',
    Describe: '',
    externalLinks: '[pixiv](https://www.pixiv.net/member.php?id=378507)'
  }, {
    Raw: 'otsumami',
    Name: 'おつまみ',
    Describe: '',

  }, {
    Raw: 'shiramayumi',
    Name: '白真弓',
    Describe: '',

  }, {
    Raw: 'chiro',
    Name: 'CHIRO | チろ',
    Describe: 'ようかい玉の輿\nチよこれいと',

  }, {
    Raw: 'junny',
    Name: 'JUNNY',
    Describe: '',

  }, {
    Raw: 'wakino keibun',
    Name: '胁乃敬文',
    Describe: '',

  }, {
    Raw: 'suzuneco',
    Name: 'Suzu猫。',
    Describe: '',

  }, {
    Raw: 'utakata',
    Name: '泡沫',
    Describe: '',

  }, {
    Raw: 'yakou',
    Name: '夜光',
    Describe: '',

  }, {
    Raw: 'lambda',
    Name: 'Lambda',
    Describe: '',

  }, {
    Raw: 'pon takahanada',
    Name: 'ポン貴花田',
    Describe: '',

  }, {
    Raw: 'kazakura',
    Name: '夏樱',
    Describe: '',

  }, {
    Raw: 'rikka kai',
    Name: 'リッカー改',
    Describe: '',

  }, {
    Raw: 'matsuryu',
    Name: '松龙',
    Describe: '',

  }, {
    Raw: 'suzutsuki kurara',
    Name: '涼月くらら',
    Describe: '',
    externalLinks: '[pixiv](https://www.pixiv.net/member.php?id=403279)'
  }, {
    Raw: 'naruhodo',
    Name: 'なるほど',
    Describe: '',

  }, {
    Raw: 'hb',
    Name: 'HB',
    Describe: '',

  }, {
    Raw: 'yamatogawa',
    Name: '大和川',
    Describe: '',

  }, {
    Raw: 'obiwan',
    Name: 'obiwan',
    Describe: '',
    externalLinks: '[pixiv](https://www.pixiv.net/member.php?id=258003)'
  }, {
    Raw: 'xin',
    Name: 'xin',
    Describe: '',
    externalLinks: '[pixiv](https://www.pixiv.net/member.php?id=3216075)'
  }, {
    Raw: 'aratamaru',
    Name: '改多丸',
    Describe: '',

  }, {
    Raw: '7zu7',
    Name: '7zu7',
    Describe: '',
    externalLinks: '[pixiv](https://www.pixiv.net/member.php?id=2405344)'
  }, {
    Raw: 'atage',
    Name: 'あたげ',
    Describe: '',

  }, {
    Raw: 'ebina ebi',
    Name: '海老名えび',
    Describe: '',

  }, {
    Raw: 'kisen',
    Name: '奇仙',
    Describe: '',

  }, {
    Raw: 'kyockcho',
    Name: 'きょくちょ',
    Describe: '',

  }, {
    Raw: 'maumen',
    Name: 'まうめん',
    Describe: '',

  }, {
    Raw: 'nukunuku',
    Name: 'ぬくぬく',
    Describe: '',

  }, {
    Raw: 'sumiyoshi',
    Name: 'すみよし',
    Describe: '',

  }, {
    Raw: 'umeko',
    Name: 'うめ子',
    Describe: '',

  }, {
    Raw: 'yamada yuuya',
    Name: 'ヤマダユウヤ',
    Describe: '',

  }, {
    Raw: 'yumoteliuce',
    Name: 'ユモテリウス',
    Describe: '',

  }, {
    Raw: 'ichihaya',
    Name: 'いちはや',
    Describe: '',

  }, {
    Raw: 'oboro',
    Name: '胧',
    Describe: '',

  }, {
    Raw: 'takayanagi katsuya',
    Name: '高柳カツヤ',
    Describe: '',

  }, {
    Raw: 'hori hiroaki',
    Name: '堀博昭',
    Describe: '',

  }, {
    Raw: 'yuugiri',
    Name: '夕雾',
    Describe: '',

  }, {
    Raw: 'eba',
    Name: 'EBA',
    Describe: '',

  }, {
    Raw: 'kutibue',
    Name: 'くちぶえ',
    Describe: '',

  }, {
    Raw: 'aoi shou',
    Name: '葵抄',
    Describe: '',

  }, {
    Raw: 'myougi kulaganosuke',
    Name: '妙義倉賀ノ助',
    Describe: '',

  }, {
    Raw: 'karatakewari',
    Name: 'からたけわり',
    Describe: '',

  }, {
    Raw: 'mifune seijirou',
    Name: '三船诚二郎',
    Describe: '',

  }, {
    Raw: 'natsu no oyatsu',
    Name: '夏のおやつ',
    Describe: '',

  }, {
    Raw: 'homura subaru',
    Name: '焔すばる',
    Describe: '',

  }, {
    Raw: 'dakouin saburou',
    Name: '蛇光院三郎',
    Describe: '',

  }, {
    Raw: 'gura nyuutou',
    Name: 'ぐら乳頭',
    Describe: '',

  }, {
    Raw: 'inomaru',
    Name: 'いのまる',
    Describe: '',

  }, {
    Raw: 'iori yuzuru',
    Name: '庵让',
    Describe: '',

  }, {
    Raw: 'itaba hiroshi',
    Name: '板場広し',
    Describe: '',

  }, {
    Raw: 'james hotate',
    Name: 'ジェームスほたて',
    Describe: '',

  }, {
    Raw: 'jamming',
    Name: 'じゃみんぐ',
    Describe: '',

  }, {
    Raw: 'mitsuki rintarou',
    Name: '水月林太郎',
    Describe: '',

  }, {
    Raw: 'n.o. chachamaru',
    Name: 'N.O-茶々丸',
    Describe: '',

  }, {
    Raw: 'naga',
    Name: 'な～が',
    Describe: '',

  }, {
    Raw: 'nakamura nishiki',
    Name: '中村锦',
    Describe: '',

  }, {
    Raw: 'noq',
    Name: 'NOQ（下月重吾）',
    Describe: '',

  }, {
    Raw: 'otonashi kyousuke',
    Name: '音无响介',
    Describe: '',

  }, {
    Raw: 'saki urara',
    Name: 'さきうらら',
    Describe: '',

  }, {
    Raw: 'shinogi a-suke',
    Name: 'しのぎ鋭介',
    Describe: '',

  }, {
    Raw: 'tonami satoshi',
    Name: 'となみさとし',
    Describe: '',

  }, {
    Raw: 'yajima index',
    Name: '矢岛Index',
    Describe: '',

  }, {
    Raw: 'yoshitaka amano',
    Name: '天野喜孝',
    Describe: '天野喜孝（1952年3月26日－），原名为天野嘉孝，日本静冈市出身的画家、人物设计师及插图画家，擅长舞台美术及服装设计。其作品散见各种艺术创作活动中，计有动画人物设计、电玩游戏视觉概念设计、书籍的封面设计与内页插画，舞蹈、戏剧、电影的场景设计、背景美术设计、服装设计等。',
    externalLinks: '[维基百科](https://zh.wikipedia.org/wiki/天野喜孝) [官方博客](http://ameblo.jp/amanoyoshitaka/) (*)'
  }, {
    Raw: 'aoba hachi',
    Name: '青葉はち',
    Describe: '',

  }, {
    Raw: 'minami',
    Name: 'みなみ',
    Describe: '',

  }, {
    Raw: 'ouji hiyoko',
    Name: '桜路ひよこ（ひなづか凉）',
    Describe: '',

  }, {
    Raw: 'yoshiro',
    Name: '夜士郎',
    Describe: '',

  }, {
    Raw: 'urushihara satoshi',
    Name: '漆原智志',
    Describe: '漆原智志（本名，日语：うるし原 智志，1966年2月9日－）是广岛县出身的男性动画师、人物设计师、漫画家。隶属Office Earthwork。',
    externalLinks: '[维基百科](https://zh.wikipedia.org/zh-cn/漆原智志) [个人博客](http://blog.livedoor.jp/uruchi1/) (*)'
  }, {
    Raw: 'yukijirushi',
    Name: '逝印',
    Describe: '',

  }, {
    Raw: 'riichu',
    Name: 'りいちゅ',
    Describe: '',

  }, {
    Raw: 'momo no suidousui',
    Name: 'モモの水道水',
    Describe: '',

  }, {
    Raw: 'kamitsurugi ouka',
    Name: '神剑樱花',
    Describe: '',

  }, {
    Raw: 'kantaka',
    Name: 'かんたか',
    Describe: '',

  }, {
    Raw: 'katagiri hinata',
    Name: '片桐雏太',
    Describe: '',

  }, {
    Raw: 'kinosaki reisui',
    Name: '城崎冷水',
    Describe: '',

  }, {
    Raw: 'kuwada yuuki',
    Name: 'くわだゆうき',
    Describe: '',

  }, {
    Raw: 'mayusaki yuu',
    Name: '茧咲悠',
    Describe: '',

  }, {
    Raw: 'natsuhiko',
    Name: '夏彦',
    Describe: '',

  }, {
    Raw: 'reita',
    Name: 'rei太',
    Describe: '',

  }, {
    Raw: 'saeki hokuto',
    Name: 'さえき北都',
    Describe: '',

  }, {
    Raw: 'shinozuka atsuto',
    Name: 'しのづかあつと',
    Describe: '',

  }, {
    Raw: 'yatsuha kanan',
    Name: '八叶香南',
    Describe: '',

  }, {
    Raw: 'hashibiro kou',
    Name: '橋広こう',
    Describe: '',

  }, {
    Raw: 'koutarou',
    Name: 'こうたろう',
    Describe: '',

  }, {
    Raw: 'piririnegi',
    Name: 'ぴりりねぎ',
    Describe: '',

  }, {
    Raw: 'spiritus tarou',
    Name: 'スピリタス太郎',
    Describe: '',

  }, {
    Raw: 'tel',
    Name: '朝峰テル',
    Describe: '',

  }, {
    Raw: 'tomomimi shimon',
    Name: 'ともみみしもん',
    Describe: '',

  }, {
    Raw: 'mitsumomo mam',
    Name: '蜜桃まむ',
    Describe: '',

  }, {
    Raw: 'lolisin',
    Name: 'ろりしn',
    Describe: '',

  }, {
    Raw: 'miyako hito',
    Name: 'ミヤコヒト',
    Describe: '',

  }, {
    Raw: 'sola bozu',
    Name: '空坊主',
    Describe: '',

  }, {
    Raw: 'mimonel',
    Name: 'ミモネル',
    Describe: '',

  }, {
    Raw: 'kloah',
    Name: 'Kloah',
    Describe: '',

  }, {
    Raw: 'chirumakuro',
    Name: 'ちるまくろ',
    Describe: '',

  }, {
    Raw: 'fumihiko',
    Name: 'ふみひこ',
    Describe: '',

  }, {
    Raw: 'gustav',
    Name: 'ぐすたふ',
    Describe: '',

  }, {
    Raw: 'matsuna hitoshi',
    Name: '松名一',
    Describe: '',

  }, {
    Raw: 'uekan',
    Name: 'うえかん',
    Describe: '',

  }, {
    Raw: 'koga ryouichi',
    Name: '古贺亮一',
    Describe: '',

  }, {
    Raw: 'sakai nayuta',
    Name: '坂井なゆ太',
    Describe: '',

  }, {
    Raw: 'fan no hitori',
    Name: '煌野一人',
    Describe: '',

  }, {
    Raw: 'yuuzu tsushiro',
    Name: 'ゆうづつしろ',
    Describe: '',

  }, {
    Raw: 'sendou hachi',
    Name: '仙道八',
    Describe: '',

  }, {
    Raw: 'saeki',
    Name: '佐伯',
    Describe: '',

  }, {
    Raw: 'cool kyou shinja',
    Name: 'クール教信者',
    Describe: '',

  }, {
    Raw: 'hirasaka fuyu',
    Name: '比良坂冬',
    Describe: '',

  }, {
    Raw: 'joy',
    Name: 'じょい',
    Describe: '',

  }, {
    Raw: 'kasuga souichi',
    Name: 'カスガソウイチ',
    Describe: '',

  }, {
    Raw: 'kemonono',
    Name: 'けものの★',
    Describe: '',

  }, {
    Raw: 'mameko',
    Name: 'まめこ',
    Describe: '',

  }, {
    Raw: 'miyoshi',
    Name: 'みよし',
    Describe: '',

  }, {
    Raw: 'neriume',
    Name: 'ねりうめ',
    Describe: '',

  }, {
    Raw: 'odd',
    Name: 'Odd',
    Describe: '',

  }, {
    Raw: 'otone',
    Name: '音音',
    Describe: '',

  }, {
    Raw: 'saku jirou',
    Name: '咲次朗',
    Describe: '',

  }, {
    Raw: 'torimushi',
    Name: '鸟莉蒸师',
    Describe: '',

  }, {
    Raw: 'ai ha muteki',
    Name: '愛は無敵',
    Describe: '',

  }, {
    Raw: 'kazetani yasunari',
    Name: '风谷安成',
    Describe: '',

  }, {
    Raw: 'amatarou',
    Name: '天太郎',
    Describe: '',

  }, {
    Raw: 'aoi hitori',
    Name: '葵ヒトリ',
    Describe: '',

  }, {
    Raw: 'aoten',
    Name: '青点',
    Describe: '',

  }, {
    Raw: 'clone ningen',
    Name: 'clone人間',
    Describe: '',

  }, {
    Raw: 'dowman sayman',
    Name: '道满晴明',
    Describe: '',

  }, {
    Raw: 'kagura moromi',
    Name: '神楽もろみ',
    Describe: '',

  }, {
    Raw: 'mikaze takashi',
    Name: '水风天',
    Describe: '',

  }, {
    Raw: 'kurogane kenn',
    Name: '玄铁绚',
    Describe: '',

  }, {
    Raw: 'momo youkan',
    Name: 'ももようかん',
    Describe: '',

  }, {
    Raw: 'musashimaru',
    Name: 'ムサシマル',
    Describe: '',

  }, {
    Raw: 'nixinamo lens',
    Name: 'にびなも凸面体',
    Describe: '',

  }, {
    Raw: 'osomatsu',
    Name: 'おそまつ',
    Describe: '',

  }, {
    Raw: 'sanagi torajirou',
    Name: '蛹虎次郎',
    Describe: '',

  }, {
    Raw: 'eiichirou',
    Name: '瑛一朗',
    Describe: '',

  }, {
    Raw: 'izawa shinichi',
    Name: '伊泽慎壹',
    Describe: '',

  }, {
    Raw: 'kurumiya mashimin',
    Name: '胡桃屋ましみん',
    Describe: '',

  }, {
    Raw: 'miura takehiro',
    Name: 'みうらたけひろ',
    Describe: '',

  }, {
    Raw: 'sena youtarou',
    Name: '濑奈阳太郎',
    Describe: '',

  }, {
    Raw: 'yumesaki sanjuro',
    Name: '夢咲三十郎',
    Describe: '',

  }, {
    Raw: 'aino chie',
    Name: 'あいの智絵',
    Describe: '',

  }, {
    Raw: 'bakuya',
    Name: 'ばくや',
    Describe: '',

  }, {
    Raw: 'c.meiko',
    Name: 'C.みーこ',
    Describe: '',

  }, {
    Raw: 'eightman',
    Name: 'えいとまん',
    Describe: '',

  }, {
    Raw: 'henoeno',
    Name: 'へのえの',
    Describe: '',

  }, {
    Raw: 'kurofood',
    Name: 'くろふーど',
    Describe: '',

  }, {
    Raw: 'momozukuku',
    Name: 'ももずくく',
    Describe: '',

  }, {
    Raw: 'pija',
    Name: 'ピジャ',
    Describe: '',

  }, {
    Raw: 'psycho',
    Name: 'さいこ',
    Describe: '',

  }, {
    Raw: 'rico',
    Name: 'Rico',
    Describe: '',

  }, {
    Raw: 'tomonaga kenji',
    Name: '友永ケンジ',
    Describe: '',

  }, {
    Raw: 'fukuyama naoto',
    Name: '复八磨直兔',
    Describe: '',

  }, {
    Raw: 'kurokawa otogi',
    Name: '黒川おとぎ',
    Describe: '',

  }, {
    Raw: 'satou takumi',
    Name: '佐藤匠',
    Describe: '',

  }, {
    Raw: 'shino',
    Name: 'シノ',
    Describe: '',

  }, {
    Raw: 'shousan bouzu',
    Name: 'しょうさん坊主',
    Describe: '',

  }, {
    Raw: 'yamabuki zarame',
    Name: '山吹ざらめ',
    Describe: '',

  }, {
    Raw: 'magatama',
    Name: 'マガタマ',
    Describe: '',

  }, {
    Raw: 'mako kujira',
    Name: 'まこくじら',
    Describe: '',

  }, {
    Raw: 'uesugi kyoushirou',
    Name: '上杉响士郎',
    Describe: '',

  }, {
    Raw: 'kai hiroyuki',
    Name: '甲斐ひろゆき',
    Describe: '',

  }, {
    Raw: 'kihiru',
    Name: 'きひる',
    Describe: '',

  }, {
    Raw: 'kogaku kazuya',
    Name: '虎顎かずや',
    Describe: '',

  }, {
    Raw: 'kokonoki nao',
    Name: 'ここのき奈緒',
    Describe: '',

  }, {
    Raw: 'naz',
    Name: 'NAZ',
    Describe: '',

  }, {
    Raw: 'neriwasabi',
    Name: 'ねりわさび',
    Describe: '',

  }, {
    Raw: 'yonyon',
    Name: 'よんよん',
    Describe: '',

  }, {
    Raw: 'yugami goosyu',
    Name: '由上ゴーシュ',
    Describe: '',

  }, {
    Raw: 'pedocchi',
    Name: 'ぺどっち',
    Describe: '',
    externalLinks: '[pixiv](https://www.pixiv.net/member.php?id=192945)'
  }, {
    Raw: 'hokou kikai',
    Name: '补讲机械',
    Describe: '',

  }, {
    Raw: 'papermania',
    Name: '奴隶夫人',
    Describe: '',

  }, {
    Raw: 'kawahagitei',
    Name: 'かわはぎ亭',
    Describe: '',

  }, {
    Raw: 'kirieppa',
    Name: 'キリエっぱ',
    Describe: '',

  }, {
    Raw: 'shohei',
    Name: '将兵',
    Describe: '',

  }, {
    Raw: 'kiyose',
    Name: 'KIYOSE',
    Describe: '',

  }, {
    Raw: 'u-tom',
    Name: 'う~とむ',
    Describe: '',

  }, {
    Raw: 'shiramori yuse',
    Name: '白森ゆせ',
    Describe: '',

  }, {
    Raw: 'bak hyeong jun',
    Name: '朴亨濬',
    Describe: '',

  }, {
    Raw: 'motsu aki',
    Name: 'もつあき',
    Describe: '',

  }, {
    Raw: 'yanagihara mitsuki',
    Name: '柳原ミツキ',
    Describe: '',

  }, {
    Raw: 'ponkotsu works',
    Name: 'ぽんこつわーくす',
    Describe: '',

  }, {
    Raw: 'nibo',
    Name: 'にぼ',
    Describe: '',

  }, {
    Raw: 'mightyhonk',
    Name: 'MightyHonk',
    Describe: '',

  }, {
    Raw: 'goldendawn',
    Name: 'Goldendawn',
    Describe: '',

  }, {
    Raw: 'fatke',
    Name: 'FatKE',
    Describe: '',

  }, {
    Raw: 'satsuki neko',
    Name: '五月猫',
    Describe: '',

  }, {
    Raw: 'akinashi yuu',
    Name: '春夏冬ゆう',
    Describe: '',
    externalLinks: '[pixiv](https://www.pixiv.net/member.php?id=10769105)'
  }, {
    Raw: 'jakou nezumi',
    Name: 'じゃこうねずみ',
    Describe: '',

  }, {
    Raw: 'hamd',
    Name: 'HAMD',
    Describe: '',

  }, {
    Raw: 'nagi yuki',
    Name: '凪居ユキ',
    Describe: '',

  }, {
    Raw: 'kusui aruta',
    Name: '久水あるた',
    Describe: '',

  }, {
    Raw: 'tamanosuke',
    Name: 'たまのすけ',
    Describe: '',

  }, {
    Raw: 'minamihama yoriko',
    Name: '南浜よりこ',
    Describe: '',

  }, {
    Raw: 'pd',
    Name: 'Pd',
    Describe: '',

  }, {
    Raw: 'butcha-u',
    Name: 'ブッチャーU',
    Describe: '',

  }, {
    Raw: 'nekomata naomi',
    Name: 'ねこまたなおみ',
    Describe: '',

  }, {
    Raw: 'kiichi',
    Name: 'きいち',
    Describe: '',

  }, {
    Raw: 'norve watanabe',
    Name: 'なーべ渡辺',
    Describe: '',

  }, {
    Raw: 'jin',
    Name: 'Jin',
    Describe: '',

  }, {
    Raw: 'luv p',
    Name: 'Luv P',
    Describe: '',

  }, {
    Raw: 'rozer',
    Name: 'ROZER',
    Describe: '',

  }, {
    Raw: 'mame danuki',
    Name: 'まめだぬき',
    Describe: '',

  }, {
    Raw: 'lolicept',
    Name: 'LOLICEPT',
    Describe: '',

  }, {
    Raw: 'shiduki michiru',
    Name: 'しづきみちる',
    Describe: '',

  }, {
    Raw: 'jet yowatari',
    Name: 'ジェット世渡り',
    Describe: '',

  }, {
    Raw: 'jigeum',
    Name: '지금',
    Describe: '',

  }, {
    Raw: 'oyster',
    Name: 'オイスター',
    Describe: '',

  }, {
    Raw: 'imachi',
    Name: 'いまち',
    Describe: '',

  }, {
    Raw: 'momiyama',
    Name: 'もみやま',
    Describe: '',

  }, {
    Raw: 'shimantogawa',
    Name: '四万十川',
    Describe: '',

  }, {
    Raw: 'zhen lu',
    Name: '珍绿',
    Describe: '',

  }, {
    Raw: 'devilhs',
    Name: 'Devil_HS',
    Describe: '',

  }, {
    Raw: 'aina nana',
    Name: '愛菜奈々',
    Describe: '',

  }, {
    Raw: 'yokoshima takemaru',
    Name: '邪武丸',
    Describe: '',

  }, {
    Raw: 'furokuma',
    Name: 'ふろくま',
    Describe: '',

  }, {
    Raw: 'hawa',
    Name: 'はわ',
    Describe: '',

  }, {
    Raw: 'tomose shunsaku',
    Name: 'トモセシュンサク',
    Describe: '',

  }, {
    Raw: 'reiha',
    Name: '零覇',
    Describe: '',

  }, {
    Raw: 'chimaq',
    Name: 'チマQ',
    Describe: '',

  }, {
    Raw: 'magaki ryouta',
    Name: '間垣りょうた',
    Describe: '',

  }, {
    Raw: 'yukino minato',
    Name: '雪野みなと',
    Describe: '',

  }, {
    Raw: 'maruchang',
    Name: '丸ちゃん。',
    Describe: '',

  }, {
    Raw: 'a1',
    Name: 'A1',
    Describe: '',

  }, {
    Raw: 'sukiyo',
    Name: 'スキヨ',
    Describe: '',

  }, {
    Raw: 'aiue oka',
    Name: '爱上陆',
    Describe: '',

  }, {
    Raw: 'rustle',
    Name: 'らする',
    Describe: '',

  }, {
    Raw: 'calipur',
    Name: 'ｶﾘﾊﾟ−',
    Describe: '',

  }, {
    Raw: 'dokurosan',
    Name: 'どくろさん',
    Describe: '',

  }, {
    Raw: 'rebis',
    Name: 'Rebis',
    Describe: '',

  }, {
    Raw: 'taihei tengoku',
    Name: '太平天极',
    Describe: '',

  }, {
    Raw: 'hitomaru',
    Name: '人丸',
    Describe: '',

  }, {
    Raw: 'kurozu',
    Name: 'くろず',
    Describe: '',

  }, {
    Raw: 'unagimaru',
    Name: '鳗丸',
    Describe: '',

  }, {
    Raw: 'decarabia',
    Name: 'デカラビア',
    Describe: '',

  }, {
    Raw: 'takurou',
    Name: 'たくろう',
    Describe: '',

  }, {
    Raw: 'tsukimoto kizuki',
    Name: '月本筑希',
    Describe: '',

  }, {
    Raw: 'taigiakira',
    Name: 'タイギアキラ',
    Describe: '',

  }, {
    Raw: 'yd',
    Name: 'YD',
    Describe: '',

  }, {
    Raw: 'ishikawa naoya',
    Name: '石川直哉',
    Describe: '',

  }, {
    Raw: 'wb',
    Name: 'WB',
    Describe: '',

  }, {
    Raw: 'takaku nozomu',
    Name: '高玖のぞむ',
    Describe: '',

  }, {
    Raw: 'oni-noboru',
    Name: 'Oni-noboru',
    Describe: '',

  }, {
    Raw: 'hamo',
    Name: 'はも',
    Describe: '',

  }, {
    Raw: 'satsumaage',
    Name: 'さつま揚げ',
    Describe: '',

  }, {
    Raw: 'abu',
    Name: 'アブ | ABU',
    Describe: 'めろですうぃーぷ\nAbsolute',

  }, {
    Raw: 'sinntarou',
    Name: '心太朗',
    Describe: '',

  }, {
    Raw: 'suzuki hajime',
    Name: '透月ハジメ',
    Describe: '',

  }, {
    Raw: 'kotoba ai',
    Name: 'コトバアイ',
    Describe: '',

  }, {
    Raw: 'strong bana',
    Name: 'Strong Bana',
    Describe: '',

  }, {
    Raw: 'kuroadam',
    Name: '黒葉だむ',
    Describe: '',

  }, {
    Raw: 'midoriiro no shinzou',
    Name: '緑色の心臓',
    Describe: '',

  }, {
    Raw: 'kujou danbo',
    Name: '九条だんぼ',
    Describe: '',

  }, {
    Raw: 'kagiyama pandora',
    Name: '鍵山ぱんどら',
    Describe: '',

  }, {
    Raw: 'shitto mask',
    Name: '嫉妬マスク',
    Describe: '',

  }, {
    Raw: 'umitsubame',
    Name: 'うみつばめ',
    Describe: '',

  }, {
    Raw: 'nanappe',
    Name: '七っぺ',
    Describe: '',

  }, {
    Raw: 'akeyama kitsune',
    Name: '绯山狐',
    Describe: '',

  }, {
    Raw: 'sakura',
    Name: '樱',
    Describe: '多个作者：櫻 | sakura | さくら\nsakura：\n![萌](# "http://ehgt.org/t/4e/9f/4e9fbfbb3627393542f8d969b300b09cc1f6d95f-1737501-2851-2000-jpg_l.jpg")\nさくら：\n![瞎](# "http://ehgt.org/t/18/0f/180f8c6691fd132261b68376f3f511084bdbd0e9-897960-1100-1567-jpg_l.jpg")',

  }, {
    Raw: 'yakiniku king',
    Name: '焼肉キング',
    Describe: '',

  }, {
    Raw: 'nekoi hikaru',
    Name: '猫伊光',
    Describe: '',

  }, {
    Raw: 'inanaki shiki',
    Name: '稻鸣四季',
    Describe: '',

  }, {
    Raw: 'tohgarashi hideyu',
    Name: '唐辛子ひでゆ',
    Describe: '',

  }, {
    Raw: 'shinjinkun',
    Name: '新人君',
    Describe: '',

  }, {
    Raw: 'barlun',
    Name: 'ばーるん',
    Describe: '',

  }, {
    Raw: 'kiyomiya ryou',
    Name: '清宫凉',
    Describe: '',

  }, {
    Raw: 'higata',
    Name: 'HIGATA',
    Describe: '',

  }, {
    Raw: 'outou chieri',
    Name: '樱桃千绘里',
    Describe: '',

  }, {
    Raw: 'hoshizaki hikaru',
    Name: '星崎ひかる',
    Describe: '',

  }, {
    Raw: 'shinoda sanjuurou',
    Name: '篠田参重郎',
    Describe: '',

  }, {
    Raw: 'mimi mimizu',
    Name: '実々みみず',
    Describe: '',

  }, {
    Raw: 'takemura sesshu',
    Name: '竹村雪秀',
    Describe: '',

  }, {
    Raw: 'ishigami hajime',
    Name: '石神一',
    Describe: '',

  }, {
    Raw: 'kawamori misaki',
    Name: 'かわもりみさき',
    Describe: '',

  }, {
    Raw: 'nagashima chosuke',
    Name: 'ながしま超助',
    Describe: '',

  }, {
    Raw: 'ozaki akira',
    Name: '尾崎晶',
    Describe: '',

  }, {
    Raw: 'shiomaneki',
    Name: 'シオマネキ',
    Describe: '',

  }, {
    Raw: 'takebayashi takeshi',
    Name: '武林武士',
    Describe: '',

  }, {
    Raw: 'umemaru',
    Name: 'うめ丸',
    Describe: '',

  }, {
    Raw: 'eo masaka',
    Name: 'EOまさか',
    Describe: '',

  }, {
    Raw: 'hanabi',
    Name: 'HANABi',
    Describe: '',

  }, {
    Raw: 'kakizaki kousei',
    Name: '垣崎コウセイ',
    Describe: '',

  }, {
    Raw: 'miyamoto issa',
    Name: '宫元一佐',
    Describe: '',

  }, {
    Raw: 'murasaki nyaa',
    Name: '紫☆にゃ～',
    Describe: '',

  }, {
    Raw: 'okyuuri',
    Name: 'おきゅうり',
    Describe: '',

  }, {
    Raw: 'parabola',
    Name: 'ぱらボら',
    Describe: '',

  }, {
    Raw: 'sugar milk',
    Name: 'シュガーミルク',
    Describe: '',

  }, {
    Raw: 'tachibana aruto',
    Name: '橘アルト',
    Describe: '',

  }, {
    Raw: 'yamahata rian',
    Name: '山畑璃杏',
    Describe: '',

  }, {
    Raw: 'muoto',
    Name: 'むおと',
    Describe: '',

  }, {
    Raw: 'emyo',
    Name: 'えみょ',
    Describe: '',

  }, {
    Raw: 'nazuna',
    Name: 'ナズナ',
    Describe: '',

  }, {
    Raw: 'mitsui jun',
    Name: '三井纯',
    Describe: '',

  }, {
    Raw: 'tsurugi hagane',
    Name: '蔓木钢音',
    Describe: '',

  }, {
    Raw: 'worin',
    Name: 'Worin',
    Describe: '',

  }, {
    Raw: 'haeilian',
    Name: 'Haeilian',
    Describe: '',

  }, {
    Raw: 'mayui yukisaki',
    Name: 'Mayui Yukisaki',
    Describe: '',

  }, {
    Raw: 'asan',
    Name: 'あさん',
    Describe: '',

  }, {
    Raw: 'akahige',
    Name: '赤髭',
    Describe: '',

  }, {
    Raw: 'nangou jingeru',
    Name: '南郷じんげる',
    Describe: '',

  }, {
    Raw: 'mitsurugi aoi',
    Name: '能都くるみ（みつるぎあおい）',
    Describe: '',
    externalLinks: '[pixiv](https://www.pixiv.net/member.php?id=441987)'
  }, {
    Raw: 'kuuchuu yousai',
    Name: '空中幼彩',
    Describe: '',

  }, {
    Raw: 'kotomi yo-ji',
    Name: 'ことみようじ',
    Describe: '',

  }, {
    Raw: 'hiRawa nagi',
    Name: '广轮凪',
    Describe: '',

  }, {
    Raw: 'kanehira morihito',
    Name: '金平守人',
    Describe: '',

  }, {
    Raw: 'kii takashi',
    Name: 'キイタカシ',
    Describe: '',

  }, {
    Raw: 'kouzuki rio',
    Name: '香月りお',
    Describe: '',

  }, {
    Raw: 'matsusaka takeshi',
    Name: '松阪刚志',
    Describe: '',

  }, {
    Raw: 'nagai michinori',
    Name: '永井道纪',
    Describe: '',

  }, {
    Raw: 'nagisa minami',
    Name: '渚ミナミ',
    Describe: '',

  }, {
    Raw: 'alexi',
    Name: 'アレキシ',
    Describe: '',

  }, {
    Raw: 'syati kamaboko',
    Name: 'シャチカマボコ',
    Describe: '',

  }, {
    Raw: 'benantoka',
    Name: 'Beなんとか',
    Describe: '',

  }, {
    Raw: 'dynamite moca',
    Name: 'ダイナマイトmoca',
    Describe: '',

  }, {
    Raw: 'sakurafubuki nel',
    Name: '桜吹雪ねる',
    Describe: '',

  }, {
    Raw: 'urai tami',
    Name: '浦井民',
    Describe: '',

  }, {
    Raw: 'yusa',
    Name: 'ゆさ',
    Describe: '',

  }, {
    Raw: 'gyuunyuu rinda',
    Name: '牛乳リンダ',
    Describe: '',

  }, {
    Raw: 'usagi nagomu',
    Name: 'うさぎなごむ',
    Describe: '',

  }, {
    Raw: 'oohira sunset',
    Name: '太平さんせっと',
    Describe: '',

  }, {
    Raw: 'obui',
    Name: 'おぶい',
    Describe: '',

  }, {
    Raw: 'amazeroth',
    Name: 'Amazeroth',
    Describe: '',

  }, {
    Raw: 'batsu',
    Name: 'ばつ',
    Describe: '',

  }, {
    Raw: 'campbell gichou',
    Name: 'キャンベル議長',
    Describe: '',

  }, {
    Raw: 'hinotsuki neko',
    Name: '日月ネコ',
    Describe: '',

  }, {
    Raw: 'jake',
    Name: 'じぇいく',
    Describe: '',

  }, {
    Raw: 'kamaboko red',
    Name: 'かまぼこRED',
    Describe: '',

  }, {
    Raw: 'koharu nanakusa',
    Name: '小春七草',
    Describe: '',

  }, {
    Raw: 'kousuke',
    Name: '交介',
    Describe: '',

  }, {
    Raw: 'kuronomiki',
    Name: '黒ノ樹',
    Describe: '',

  }, {
    Raw: 'kurosawa yuri',
    Name: '黒澤ユリ',
    Describe: '',

  }, {
    Raw: 'misaki kaho.',
    Name: 'ミサキカホ。',
    Describe: '',

  }, {
    Raw: 'ogura shuuichi',
    Name: '小仓修一',
    Describe: '',

  }, {
    Raw: 'yuuki homura',
    Name: '结城焰',
    Describe: '',

  }, {
    Raw: 'yamamoto',
    Name: '山本',
    Describe: '',

  }, {
    Raw: 'yamamoto yammy',
    Name: '山本やみー',
    Describe: '',

  }, {
    Raw: 'murakami maki',
    Name: '村上真纪',
    Describe: 'BL漫画《万有引力》的作者',

  }, {
    Raw: 'ditama bow',
    Name: 'ぢたま(某)',
    Describe: '《亲吻姐姐》的作者 <br/> 很多成功的漫画家都是从画本子开始的',

  }, {
    Raw: 'yabuki kentarou',
    Name: '矢吹健太朗',
    Describe: 'ToLOVEる，不是本子，胜似本子的漫画',

  }, {
    Raw: 'clamp',
    Name: 'CLAMP',
    Describe: '',

  }, {
    Raw: 'kinoshita rei',
    Name: 'きのした黎',
    Describe: '',

  }, {
    Raw: 'waero',
    Name: '西野',
    Describe: '',

  }, {
    Raw: 'modaetei anetarou',
    Name: '闷亭姉太郎',
    Describe: '',

  }, {
    Raw: 'modaetei imojirou',
    Name: '闷亭妹次郎',
    Describe: '',

  }, {
    Raw: 'fuckuma',
    Name: 'ふぁっ熊',
    Describe: '',

  }, {
    Raw: 'itou daiku',
    Name: '伊藤第九',
    Describe: '',

  }, {
    Raw: 'kaiduka',
    Name: 'かいづか',
    Describe: '',

  }, {
    Raw: 'moketa',
    Name: 'もけ太',
    Describe: '',

  }, {
    Raw: 'nodame',
    Name: 'nod饴',
    Describe: '',

  }, {
    Raw: 'sage joh',
    Name: 'sage・ジョー',
    Describe: '',

  }, {
    Raw: 'utsutsu minoru',
    Name: 'うつつ＊みのる',
    Describe: '',

  }, {
    Raw: 'isou doubaku',
    Name: '位相同爆',
    Describe: '',

  }, {
    Raw: 'kenshou izanamu',
    Name: '剣匠イザナム',
    Describe: '',

  }, {
    Raw: 'kotobuki kazuki',
    Name: '琴吹かづき',
    Describe: '',

  }, {
    Raw: 'mayumi daisuke',
    Name: '真弓大介',
    Describe: '',

  }, {
    Raw: 'nagano noriko',
    Name: '永野のりこ',
    Describe: '',

  }, {
    Raw: 'protonsaurus',
    Name: 'プロトンザウルス',
    Describe: '',

  }, {
    Raw: 'sabe',
    Name: 'SABE',
    Describe: '',

  }, {
    Raw: 'shibata masahiro',
    Name: '柴田昌弘',
    Describe: '',

  }, {
    Raw: 'youkihi',
    Name: '阳气婢',
    Describe: '',

  }, {
    Raw: 'kinoshita ichi',
    Name: '木下壹',
    Describe: '',

  }, {
    Raw: '92m',
    Name: '92M',
    Describe: '',

  }, {
    Raw: 'kasukabe taro',
    Name: '春日部太郎',
    Describe: '',

  }, {
    Raw: 'zucchini',
    Name: 'ズッキーニ',
    Describe: '',

  }, {
    Raw: 'shirane taito',
    Name: '白根戴斗',
    Describe: '',

  }, {
    Raw: 'morimi ashita',
    Name: '森见明日',
    Describe: '',

  }, {
    Raw: 'upanishi.',
    Name: 'うぱ西。',
    Describe: '',

  }, {
    Raw: 'shimazu isami',
    Name: '島津いさみ',
    Describe: '',

  }, {
    Raw: 'arumajiki',
    Name: '或真じき',
    Describe: '',

  }, {
    Raw: 'uru',
    Name: 'Uru',
    Describe: '',

  }, {
    Raw: 'higashitotsuka raisuta',
    Name: '東戸塚らいすた',
    Describe: '',

  }, {
    Raw: 'nizimoto hirok',
    Name: '虹元ひろk',
    Describe: '',

  }, {
    Raw: 'kinnikku',
    Name: 'キンニック',
    Describe: '',

  }, {
    Raw: 'takepen',
    Name: 'タケペン',
    Describe: '',

  }, {
    Raw: 'taikou',
    Name: 'タイコウ',
    Describe: '',

  }, {
    Raw: 'aikawa touma',
    Name: '藍川とうま',
    Describe: '',

  }, {
    Raw: 'tamanoi peromekuri',
    Name: '玉乃井ぺろめくり',
    Describe: '',

  }, {
    Raw: 'shinozuka george',
    Name: '筱塚酿二',
    Describe: '',

  }, {
    Raw: 'miotama',
    Name: 'みおたま',
    Describe: '',

  }, {
    Raw: 'kido keiji',
    Name: '城户敬司',
    Describe: '',

  }, {
    Raw: 'terada ochiko',
    Name: '寺田落子',
    Describe: '',

  }, {
    Raw: 'chimi',
    Name: 'ちみ',
    Describe: '',

  }, {
    Raw: 'haruyukiko',
    Name: 'はるゆきこ',
    Describe: '',

  }, {
    Raw: 'horitomo',
    Name: 'ほりとも',
    Describe: '',

  }, {
    Raw: 'jun',
    Name: 'Jun',
    Describe: '',

  }, {
    Raw: 'marneko',
    Name: 'まる寝子',
    Describe: '',

  }, {
    Raw: 'miyamoto liz',
    Name: '宮本りず',
    Describe: '',

  }, {
    Raw: 'nanase mizuho',
    Name: '七濑瑞穗',
    Describe: '',

  }, {
    Raw: 'satou souji',
    Name: '佐藤想次',
    Describe: '',

  }, {
    Raw: 'shiina kazuki',
    Name: 'しいなかずき',
    Describe: '',

  }, {
    Raw: 'sumisuzu',
    Name: 'すみすず',
    Describe: '',

  }, {
    Raw: 'take',
    Name: 'タケ',
    Describe: '',

  }, {
    Raw: 'yukiusagi.',
    Name: 'ゆきうさぎ。',
    Describe: '',

  }, {
    Raw: 'clearite',
    Name: 'くれりて',
    Describe: '',

  }, {
    Raw: 'makuro',
    Name: 'まくろ',
    Describe: '',

  }, {
    Raw: 'bakugatou',
    Name: '麦芽糖',
    Describe: '',

  }, {
    Raw: 'nekohane ryou',
    Name: '猫羽燎',
    Describe: '',

  }, {
    Raw: 'gamang',
    Name: 'Gamang',
    Describe: '',

  }, {
    Raw: 'kiryu reihou',
    Name: '桐生玲峰',
    Describe: '',

  }, {
    Raw: 'koutaro',
    Name: 'こうたろ',
    Describe: '',

  }, {
    Raw: 'sasaoka gungu',
    Name: '笹岡ぐんぐ',
    Describe: '',

  }, {
    Raw: 'mikazuki akira',
    Name: 'みかづきあきら!',
    Describe: '',

  }, {
    Raw: 'mikoshiro honnin',
    Name: 'みこしろ本人',
    Describe: '巫代凪遠',

  }, {
    Raw: 'ariko youichi',
    Name: '有子瑶一',
    Describe: '',

  }, {
    Raw: 'taira tsukune',
    Name: '平つくね',
    Describe: '',

  }, {
    Raw: 'monikano',
    Name: 'モニカノ',
    Describe: '',

  }, {
    Raw: 'kayama rim',
    Name: '香山リム',
    Describe: '',

  }, {
    Raw: 'tomokichi',
    Name: '友吉',
    Describe: '',

  }, {
    Raw: 'nagi ichi',
    Name: '凪市',
    Describe: '',

  }, {
    Raw: 'ponsu jure',
    Name: 'ぽん酢',
    Describe: '',

  }, {
    Raw: 'arekusa mahone',
    Name: '荒草まほん',
    Describe: '',

  }, {
    Raw: 'akasa ai',
    Name: 'あかさあい',
    Describe: '',

  }, {
    Raw: 'mizu umi',
    Name: '瑞海',
    Describe: '',

  }, {
    Raw: 'hisato',
    Name: 'ひさと',
    Describe: '',

  }, {
    Raw: 'gyuunyuu nomio',
    Name: '牛乳のみお',
    Describe: '',

  }, {
    Raw: 'konkichi',
    Name: '绀吉',
    Describe: '',

  }, {
    Raw: 'butcherboy',
    Name: 'ButcherBOY',
    Describe: '',
    externalLinks: '[pixiv](https://www.pixiv.net/member.php?id=2367927)'
  }, {
    Raw: 'aim',
    Name: 'AIM',
    Describe: '',

  }, {
    Raw: 'sasakuma kyouta',
    Name: 'ささくまきょうた',
    Describe: '',

  }, {
    Raw: 'tsujizen',
    Name: '辻善',
    Describe: '',

  }, {
    Raw: 'mizukoshi mayu',
    Name: '水越まゆ',
    Describe: '',

  }, {
    Raw: 'mitaonsya',
    Name: 'MITAONSYA',
    Describe: '',

  }, {
    Raw: 'tokumi yuiko',
    Name: '笃见唯子',
    Describe: '',

  }, {
    Raw: 'dantetsu',
    Name: '断铁',
    Describe: '',

  }, {
    Raw: 'inuboshi',
    Name: '犬星',
    Describe: '',

  }, {
    Raw: 'saitou tsukasa',
    Name: 'さいとうつかさ',
    Describe: '',

  }, {
    Raw: 'shinkaida tetsuyarou',
    Name: '新贝田铁也郎',
    Describe: '',

  }, {
    Raw: 'sorimura youji',
    Name: 'そりむらようじ',
    Describe: '',

  }, {
    Raw: 'yamamoto kazue',
    Name: '山本和枝',
    Describe: '',

  }, {
    Raw: 'natsuo monaka',
    Name: 'なつおもなか',
    Describe: '',

  }, {
    Raw: 'binkan argento',
    Name: 'びんかんargento',
    Describe: '',

  }, {
    Raw: 'minagiku',
    Name: 'みなぎく',
    Describe: '',

  }, {
    Raw: 'landolt tamaki',
    Name: 'ランドルトたまき',
    Describe: '',

  }, {
    Raw: 'ferallemma',
    Name: 'フィラレマ',
    Describe: '',

  }, {
    Raw: 'habara tetsu',
    Name: '叶原铁',
    Describe: '',

  }, {
    Raw: 'kisaragi miyu',
    Name: '如月みゆ',
    Describe: '',

  }, {
    Raw: 'igumox',
    Name: '井雲くす',
    Describe: '',

  }, {
    Raw: 'kuune rin',
    Name: 'くうねりん',
    Describe: '',

  }, {
    Raw: 'goto-beido',
    Name: 'ゴト・ベイドー',
    Describe: '',

  }, {
    Raw: 'morikura en',
    Name: '森仓圆',
    Describe: '',

  }, {
    Raw: 'afukuro',
    Name: 'アフ黒',
    Describe: '',

  }, {
    Raw: 'kaguyuzu',
    Name: 'カグユヅ',
    Describe: '',

  }, {
    Raw: 'dsmile',
    Name: 'DSマイル',
    Describe: '',

  }, {
    Raw: 'monoto',
    Name: 'ものと',
    Describe: '',

  }, {
    Raw: 'snowmi',
    Name: 'すのみ',
    Describe: '',

  }, {
    Raw: 'dozamura',
    Name: 'どざむら',
    Describe: '',

  }, {
    Raw: 'kiryu',
    Name: 'Kiryu',
    Describe: '',

  }, {
    Raw: 'kozakura nanane',
    Name: '小桜菜々音',
    Describe: '',

  }, {
    Raw: 'hazakura momo',
    Name: '葉桜もも',
    Describe: '',

  }, {
    Raw: 'sakura shouji',
    Name: '咲良将司',
    Describe: '',

  }, {
    Raw: 'hidiri rei',
    Name: 'ヒヂリレイ',
    Describe: '',

  }, {
    Raw: 'nadeara bukichi',
    Name: '抚荒武吉',
    Describe: '',

  }, {
    Raw: 'qoopie',
    Name: 'Qoopie',
    Describe: '',

  }, {
    Raw: 'kanbe chuji',
    Name: 'かんべ忠治',
    Describe: '',

  }, {
    Raw: 'shuten douji',
    Name: '酒呑童子',
    Describe: '',

  }, {
    Raw: 'murlachrot',
    Name: 'みうらっは',
    Describe: '',

  }, {
    Raw: 'tanaha',
    Name: '棚叶',
    Describe: '',

  }, {
    Raw: 'sakai minato',
    Name: '坂井みなと',
    Describe: '',

  }, {
    Raw: 'ijima yuu',
    Name: '伊島ユウ',
    Describe: '',

  }, {
    Raw: 'inari',
    Name: '稻荷',
    Describe: '',

  }, {
    Raw: 'momo-deary',
    Name: 'Momo-Deary',
    Describe: '',

  }, {
    Raw: 'nonaka tama',
    Name: 'のなかたま',
    Describe: '',

  }, {
    Raw: 'chinbotsu',
    Name: '沈没',
    Describe: '',

  }, {
    Raw: 'teterun',
    Name: 'ててるん',
    Describe: '',

  }, {
    Raw: 'fuetakishi',
    Name: 'フエタキシ',
    Describe: '',

  }, {
    Raw: 'purukogi',
    Name: 'プルコギ',
    Describe: '',

  }, {
    Raw: 'sawaki koma',
    Name: '沢木コマ',
    Describe: '',

  }, {
    Raw: 'ohtsuki tohru',
    Name: '大槻とおる',
    Describe: '',

  }, {
    Raw: 'hidebou',
    Name: 'ひでぼう',
    Describe: '',

  }, {
    Raw: 'kiyose kaoru',
    Name: 'キヨセ薫',
    Describe: '',

  }, {
    Raw: 'asanagi',
    Name: '朝凪',
    Describe: '',

  }, {
    Raw: 'kikunyi',
    Name: '菊にぃ',
    Describe: '',

  }, {
    Raw: 'lasto',
    Name: 'らすと～',
    Describe: '',

  }, {
    Raw: 'yoroduya hyakuhachi',
    Name: '万屋百八',
    Describe: '',

  }, {
    Raw: 'takapiko',
    Name: 'たかぴこ',
    Describe: '',

  }, {
    Raw: 'kobayashi chisato',
    Name: '小林ちさと',
    Describe: '',

  }, {
    Raw: 'siomidu',
    Name: 'しおみづ',
    Describe: '',

  }, {
    Raw: 'fudou ran',
    Name: '不动乱',
    Describe: '',

  }, {
    Raw: 'ikuya daikokudou',
    Name: '几夜大黑堂',
    Describe: '',
    externalLinks: '[pixiv](http://www.pixiv.net/member.php?id=464765)'
  }, {
    Raw: 'kaduchi',
    Name: 'カヅチ',
    Describe: '',

  }, {
    Raw: 'sakurazuki masaru',
    Name: '桜月マサル',
    Describe: '',

  }, {
    Raw: 'uchuu teiou',
    Name: '宇宙帝王',
    Describe: '',

  }, {
    Raw: 'zundarepon',
    Name: 'ズンダレぽん',
    Describe: '',

  }, {
    Raw: 'chokoboll mukakoi.',
    Name: 'チョコボール向囲。',
    Describe: '',
    externalLinks: '[Twitter](https://twitter.com/chokoboll) [pixiv](https://www.pixiv.net/member.php?id=114256)'
  }, {
    Raw: 'majirou',
    Name: 'まじろー',
    Describe: '',

  }, {
    Raw: 'nemui neru',
    Name: '眠井ねる',
    Describe: '',

  }, {
    Raw: 'takato kurosuke',
    Name: '高遠くろ助',
    Describe: '',

  }, {
    Raw: 'adachi takumi',
    Name: '安达拓实',
    Describe: '',

  }, {
    Raw: 'asamori mizuki',
    Name: '朝森瑞季',
    Describe: '',

  }, {
    Raw: 'azuma taira',
    Name: '東タイラ',
    Describe: '',

  }, {
    Raw: 'enoki tomoyuki',
    Name: '榎木知之',
    Describe: '',

  }, {
    Raw: 'fujisaka kuuki',
    Name: '藤坂空树',
    Describe: '',

  }, {
    Raw: 'grace',
    Name: 'ぐれいす',
    Describe: '',

  }, {
    Raw: 'harumi chihiro',
    Name: 'ハルミチヒロ',
    Describe: '',

  }, {
    Raw: 'hiyama shuri',
    Name: 'ヒヤマシュリ',
    Describe: '',

  }, {
    Raw: 'izumi yoshiki',
    Name: 'いづみよしき',
    Describe: '',

  }, {
    Raw: 'maakou',
    Name: '雅亚公',
    Describe: '',

  }, {
    Raw: 'tsukioka reitarou',
    Name: '月冈丽太朗',
    Describe: '',

  }, {
    Raw: 'kurokawa kei',
    Name: 'くろかわ京',
    Describe: '',

  }, {
    Raw: 'itachi',
    Name: 'いたち',
    Describe: '',

  }, {
    Raw: 'aya shachou',
    Name: '彩社长',
    Describe: '',

  }, {
    Raw: 'fukumaaya',
    Name: 'ふくまーや',
    Describe: '',

  }, {
    Raw: 'higashide irodori',
    Name: '東出イロドリ',
    Describe: '',

  }, {
    Raw: 'hiura r',
    Name: '火浦R',
    Describe: '',

  }, {
    Raw: 'karube guri',
    Name: '軽部ぐり',
    Describe: '',

  }, {
    Raw: 'kazabuki poni',
    Name: '風吹ぽに',
    Describe: '',

  }, {
    Raw: 'kusatsu terunyo',
    Name: '草津てるにょ',
    Describe: '',

  }, {
    Raw: 'mario',
    Name: 'まりお',
    Describe: '',

  }, {
    Raw: 'puniiyu',
    Name: 'ぷにいゆ',
    Describe: '',

  }, {
    Raw: 'kotengu',
    Name: 'コテング',
    Describe: '',

  }, {
    Raw: 'otare mayu',
    Name: 'おたれまゆ',
    Describe: '',

  }, {
    Raw: 'shirouzu myuuta',
    Name: '白水ミュウタ',
    Describe: '',

  }, {
    Raw: 'dosent',
    Name: 'Dosent',
    Describe: '',

  }, {
    Raw: 'fuun daiki',
    Name: '風雲だいき',
    Describe: '',

  }, {
    Raw: 'satou saori',
    Name: '佐藤沙绪理',
    Describe: '',

  }, {
    Raw: 'takashina asahi',
    Name: 'たかしな浅妃',
    Describe: '',

  }, {
    Raw: 'bkub',
    Name: 'Bkub',
    Describe: '',

  }, {
    Raw: 'gemu555',
    Name: 'Gemu555',
    Describe: '',

  }, {
    Raw: 'ichiren takushou',
    Name: '一炼托生',
    Describe: '',

  }, {
    Raw: 'katase minami',
    Name: 'カタセミナミ',
    Describe: '',

  }, {
    Raw: 'masamune shiRaw',
    Name: '士郎正宗',
    Describe: '',

  }, {
    Raw: 'nikusoukyuu',
    Name: '肉そうきゅー。',
    Describe: '',

  }, {
    Raw: 'nimu',
    Name: 'ニム',
    Describe: '',

  }, {
    Raw: 'okayusan',
    Name: 'おかゆさん',
    Describe: '',

  }, {
    Raw: 'wakai ikuo',
    Name: '若井いくお',
    Describe: '',

  }, {
    Raw: 'z-ton',
    Name: 'Zトン',
    Describe: '',

  }, {
    Raw: 'hanpera',
    Name: 'はんぺら',
    Describe: '',

  }, {
    Raw: 'hirono azuma',
    Name: '広乃あずま',
    Describe: '',

  }, {
    Raw: 'ikeda matamune',
    Name: '池田又心',
    Describe: '',

  }, {
    Raw: 'kon-kit',
    Name: '蒟吉人',
    Describe: '',

  }, {
    Raw: 'ohsaka minami',
    Name: '逢坂ミナミ',
    Describe: '',

  }, {
    Raw: 'raymon',
    Name: 'RAYMON',
    Describe: '',

  }, {
    Raw: 'shiroie mika',
    Name: '白家ミカ',
    Describe: '',

  }, {
    Raw: 'tes-mel',
    Name: 'tes_mel',
    Describe: '',

  }, {
    Raw: 'toba yuga',
    Name: '跳马游鹿',
    Describe: '',

  }, {
    Raw: 'yoshida tobio',
    Name: '吉田鸢牡',
    Describe: '',

  }, {
    Raw: 'zero no mono',
    Name: 'ゼロの者',
    Describe: '',

  }, {
    Raw: 'hige masamune',
    Name: 'ひげ政宗',
    Describe: '',

  }, {
    Raw: 'h2o',
    Name: 'H2O',
    Describe: '',

  }, {
    Raw: 'kekemotsu',
    Name: 'けけもつ',
    Describe: '',

  }, {
    Raw: 'yom',
    Name: 'よむ',
    Describe: '专画偏真实系黑丝\n![图](# "http://ehgt.org/61/11/6111588f639b42e92f7d5a7a88b520b615a77a28-1498312-1357-1920-jpg_l.jpg")![图](# "http://ehgt.org/0f/a2/0fa29862fe4ef0132018a8b865df2ddaa5d97c98-215069-1040-1500-jpg_l.jpg")![图](# "http://ehgt.org/6a/04/6a04113c83120dfaa12a76c551a17b8bc7ffbe82-11847694-2490-3520-png_l.jpg")',

  }, {
    Raw: 'yuzugin',
    Name: '柚银',
    Describe: '',

  }, {
    Raw: 'akatsuki hiziri',
    Name: 'あかつき聖',
    Describe: '',

  }, {
    Raw: 'chig',
    Name: 'Chig',
    Describe: '',

  }, {
    Raw: 'tsumugie',
    Name: 'つむじぃ',
    Describe: '',

  }, {
    Raw: 'maimu-maimu',
    Name: '舞六まいむ',
    Describe: '',

  }, {
    Raw: 'kotoyoshi yumisuke',
    Name: '琴义弓介',
    Describe: '',

  }, {
    Raw: 'mctek',
    Name: 'MCtek',
    Describe: '',

  }, {
    Raw: 'hidaka sora',
    Name: '日高空',
    Describe: '',

  }, {
    Raw: 'mashiro mami',
    Name: '眞白まみ',
    Describe: '',

  }, {
    Raw: 'sakusyaaya',
    Name: '作者文',
    Describe: '',
    externalLinks: '[pixiv](https://www.pixiv.net/member.php?id=2082705)'
  }, {
    Raw: 'yoshitani motoka',
    Name: '义谷元日',
    Describe: '',

  }, {
    Raw: 'ruschuto',
    Name: 'るしゅーと',
    Describe: '',

  }, {
    Raw: 'murata range',
    Name: '村田莲尔',
    Describe: '村田莲尔（1968年10月2日－），是日本的插画家兼设计师。出身于大阪府。其作品喜欢强调复古的质感和设计，尤其偏爱装饰艺术时期的风格。人物方面，最常描绘的则是短发美少女和苦涩的中年男子。',
    externalLinks: '[维基百科](https://zh.wikipedia.org/zh-hans/村田蓮爾) (*)'
  }, {
    Raw: 'haguhagu',
    Name: 'はぐはぐ',
    Describe: '',

  }, {
    Raw: 'reitou mikan',
    Name: 'れいとうみかん',
    Describe: '',

  }, {
    Raw: 'ruuen rouga',
    Name: '龙炎狼牙',
    Describe: '',

  }, {
    Raw: 'kisaragi nana',
    Name: '如月なな',
    Describe: '',

  }, {
    Raw: 'adumi kazuki',
    Name: 'あづみ一樹',
    Describe: '',

  }, {
    Raw: 'sasagawa iko',
    Name: '佐々川いこ',
    Describe: '',

  }, {
    Raw: 'wancho',
    Name: 'わんちょ',
    Describe: '',

  }, {
    Raw: 'kajishima masaki',
    Name: '梶岛正树',
    Describe: '梶岛正树（1962年3月15日－）是冈山县出身的动画师、角色设定和动画原作者。',
    externalLinks: '[维基百科](https://zh.wikipedia.org/zh-hans/梶島正樹) (*)'
  }, {
    Raw: 'muririn',
    Name: 'むりりん',
    Describe: '',

  }, {
    Raw: 'lilithlauda',
    Name: 'リリスラウダ',
    Describe: '',

  }, {
    Raw: 'miyase mahiro',
    Name: '宮瀬まひろ',
    Describe: '',

  }, {
    Raw: 'tajima yuki',
    Name: '田岛有纪',
    Describe: '',

  }, {
    Raw: 'nyaito',
    Name: 'にゃいと',
    Describe: '',

  }, {
    Raw: 'hitsuka no tsukimiko',
    Name: 'ひつかのつきみこ',
    Describe: '',

  }, {
    Raw: 'nagami yuu',
    Name: '永深ゆう',
    Describe: '',

  }, {
    Raw: 'oda kenichi',
    Name: 'おだけんいち',
    Describe: '',

  }, {
    Raw: 'toranoe',
    Name: 'トラノエ',
    Describe: '',

  }, {
    Raw: 'kinoebi',
    Name: 'KinoeBi',
    Describe: '',

  }, {
    Raw: 'nanashi',
    Name: '774',
    Describe: '',

  }, {
    Raw: 'yokoyama lynch',
    Name: '横山私刑',
    Describe: '',

  }, {
    Raw: 'tam',
    Name: 'TAM',
    Describe: '',

  }, {
    Raw: 'tatami',
    Name: '叠',
    Describe: '',

  }, {
    Raw: 'hoozuki shia',
    Name: '鬼灯しあ',
    Describe: '',

  }, {
    Raw: 'samantha whitten',
    Name: 'Samantha Whitten',
    Describe: '',

  }, {
    Raw: 'romi',
    Name: 'ろみ',
    Describe: '',

  }, {
    Raw: 'kamiya maneki',
    Name: 'かみやまねき',
    Describe: '',

  }, {
    Raw: 'rella',
    Name: 'Rella',
    Describe: '',

  }, {
    Raw: 'apaman',
    Name: 'あぱまん',
    Describe: '',

  }, {
    Raw: 'takamin',
    Name: 'たかみん',
    Describe: '',

  }, {
    Raw: 'pink taro',
    Name: 'ピンク太郎',
    Describe: '',

  }, {
    Raw: 'tendou masae',
    Name: '天道まさえ',
    Describe: '',

  }, {
    Raw: 'numahana',
    Name: 'ヌマハナ',
    Describe: '',

  }, {
    Raw: 'hino toshiyuki',
    Name: '飞野俊之',
    Describe: '',

  }, {
    Raw: 'yokkora',
    Name: 'ヨッコラ',
    Describe: '',

  }, {
    Raw: 'ahen',
    Name: 'AHEN',
    Describe: '',

  }, {
    Raw: 'kirishima satoshi',
    Name: '桐島サトシ',
    Describe: '',

  }, {
    Raw: 'kuroiwa madoka',
    Name: '黒磐まどか',
    Describe: '',

  }, {
    Raw: 'nanaroba hana',
    Name: 'ななろば華',
    Describe: '',

  }, {
    Raw: 'ouma',
    Name: 'OUMA',
    Describe: '',

  }, {
    Raw: 'irie jyunn',
    Name: '入江jyunn',
    Describe: '',

  }, {
    Raw: 'komeshiro kasu',
    Name: '米白粕',
    Describe: '',

  }, {
    Raw: 'gotou suzuna',
    Name: '後藤スズナ',
    Describe: '',

  }, {
    Raw: 'pettanp',
    Name: 'ペッタンP',
    Describe: '',

  }, {
    Raw: 'nanashi noizi',
    Name: 'ななしのいぢ',
    Describe: '',

  }, {
    Raw: 'koori nezumi',
    Name: '冰鼠',
    Describe: '',

  }, {
    Raw: 'fluff kevlar',
    Name: 'Fluff-Kevlar',
    Describe: '',

  }, {
    Raw: 'mukka',
    Name: 'Mukka',
    Describe: '',
    externalLinks: '[pixiv](https://www.pixiv.net/member.php?id=4346822)'
  }, {
    Raw: 'harenchi tomeko',
    Name: 'はれんちとめこ',
    Describe: '',

  }, {
    Raw: 'yukiji shia',
    Name: '雪路时爱',
    Describe: '',

  }, {
    Raw: 'mirin fu-ka',
    Name: '味燐ふーか',
    Describe: '',

  }, {
    Raw: 'toroshio',
    Name: 'とろしお',
    Describe: '',

  }, {
    Raw: 'yuzuki',
    Name: '柚木',
    Describe: '',

  }, {
    Raw: 'kusaka souji',
    Name: '久坂宗次',
    Describe: '',

  }, {
    Raw: 'izumi banya',
    Name: '和泉万夜',
    Describe: '',

  }, {
    Raw: 'katzchen',
    Name: 'Kätzchen',
    Describe: '',
    externalLinks: '[pixiv](https://www.pixiv.net/member.php?id=10669991)'
  }, {
    Raw: 'kanden sky',
    Name: '感电数寄',
    Describe: '',

  }, {
    Raw: 'heiqing langjun',
    Name: '黑青郎君',
    Describe: '',

  }, {
    Raw: 'darkmaya',
    Name: 'Darkmaya',
    Describe: '',

  }, {
    Raw: 'unini seven',
    Name: 'うにに☆せぶん',
    Describe: '',

  }, {
    Raw: 'nekometaru',
    Name: 'ねこめたる',
    Describe: '',

  }, {
    Raw: 'naoya',
    Name: '直哉',
    Describe: '',

  }, {
    Raw: 'sansyoku amido.',
    Name: '三色网户。',
    Describe: '',

  }, {
    Raw: 'yukiyanagi',
    Name: 'ゆきやなぎ',
    Describe: '',

  }, {
    Raw: 'fujimoto ikura',
    Name: '藤本いくら',
    Describe: '',

  }, {
    Raw: 'ramiya ryou',
    Name: '兰宫凉',
    Describe: '',

  }, {
    Raw: 'tamiya akito',
    Name: '田宫秋人',
    Describe: '',

  }, {
    Raw: 'joy ride',
    Name: 'JOY RIDE',
    Describe: '',

  }, {
    Raw: 'arima natsubon',
    Name: 'ありまなつぼん',
    Describe: '',

  }, {
    Raw: 'ebi ebi',
    Name: 'エビエビ',
    Describe: '',

  }, {
    Raw: 'gabyonuno',
    Name: 'ガビョ布',
    Describe: '',

  }, {
    Raw: 'heppokokun',
    Name: 'へっぽこくん',
    Describe: '',

  }, {
    Raw: 'honda aru',
    Name: '翻田亚流',
    Describe: '',

  }, {
    Raw: 'hoshino fuuta',
    Name: 'ほしのふうた',
    Describe: '',

  }, {
    Raw: 'kani kani',
    Name: 'かにかに',
    Describe: '',

  }, {
    Raw: 'katsumata kazuki',
    Name: 'かつまたかずき',
    Describe: '',

  }, {
    Raw: 'kirihara kotori',
    Name: '桐原小鸟',
    Describe: '',

  }, {
    Raw: 'kokekokko coma',
    Name: 'こけこっこ☆こま',
    Describe: '',

  }, {
    Raw: 'nagareboshi hikaru',
    Name: '流星ひかる',
    Describe: '',

  }, {
    Raw: 'mihara jun',
    Name: 'みはらじゅん',
    Describe: '',

  }, {
    Raw: 'dpc',
    Name: 'DPC',
    Describe: '',

  }, {
    Raw: 'urase shioji',
    Name: '浦瀬しおじ',
    Describe: '',

  }, {
    Raw: 'yakusho',
    Name: 'やくしょ',
    Describe: '',

  }, {
    Raw: 'kedama keito',
    Name: '毛玉ケヰト',
    Describe: '',

  }, {
    Raw: 'kurai nao',
    Name: '仓井尚',
    Describe: '',

  }, {
    Raw: 'narutaki shin',
    Name: '鳴滝しん',
    Describe: '',

  }, {
    Raw: 'matasabu yarou',
    Name: 'またさぶ野郎',
    Describe: '',

  }, {
    Raw: 'kagutsuchi',
    Name: 'カグツチ',
    Describe: '',

  }, {
    Raw: 'nyuu',
    Name: 'にゅう',
    Describe: '',

  }, {
    Raw: 'kani club',
    Name: '蟹俱乐部',
    Describe: '',

  }, {
    Raw: 'tabuchi',
    Name: 'たぶち',
    Describe: '',

  }, {
    Raw: 'nora higuma',
    Name: '野良ヒグマ',
    Describe: '',

  }, {
    Raw: 'tohyama eight',
    Name: '東山エイト',
    Describe: '',

  }, {
    Raw: 'shakuhachi nameko',
    Name: '尺八ナメコ',
    Describe: '',

  }, {
    Raw: 'bai asuka',
    Name: '呗飞鸟',
    Describe: '',

  }, {
    Raw: 'bttamako',
    Name: '豚たま子',
    Describe: '',

  }, {
    Raw: 'eggplantex',
    Name: '茄子EX',
    Describe: '',

  }, {
    Raw: 'kouno aya',
    Name: '煌乃あや',
    Describe: '',

  }, {
    Raw: 'uzuki haruka',
    Name: '卯月遥佳',
    Describe: '',

  }, {
    Raw: 'rokudenashi',
    Name: 'ロクデナシ',
    Describe: '',

  }, {
    Raw: 'mukoujima tenro',
    Name: 'むこうじまてんろ',
    Describe: '',

  }, {
    Raw: 'kamitsuki manmaru',
    Name: '上月まんまる',
    Describe: '',

  }, {
    Raw: 'kaitou yuuhi',
    Name: '快刀雄飞',
    Describe: '',

  }, {
    Raw: 'danevan',
    Name: '丹·艾凡',
    Describe: 'Dan·Evan 丹·艾凡，1987年生，上海人。目前是自由插画师，任蓝铅笔签约讲师，喜欢哲学。',
    externalLinks: '[pixiv](http://www.pixiv.net/member.php?id=142066) [微博](http://weibo.com/elzheng) [PATREON](https://www.patreon.com/danevan)'
  }, {
    Raw: 'kakifly',
    Name: 'kakifly',
    Describe: 'kakifly（日语：かきふらい），日本男性漫画家，出身于京都府。其代表作是四格漫画《K-ON！轻音部》，连载于芳文社的杂志《Manga Time Kirara》、《Manga Time Kirara Carat》。',
    externalLinks: '[维基百科](https://zh.wikipedia.org/zh-cn/kakifly) (*)'
  }, {
    Raw: 'go-it',
    Name: 'Go-It',
    Describe: '',

  }, {
    Raw: 'ibuki haruhi',
    Name: '一颯はるひ',
    Describe: '',

  }, {
    Raw: 'beauty hair',
    Name: 'ビューティ・ヘア',
    Describe: '',

  }, {
    Raw: 'yamamoto yoshifumi',
    Name: '山本善文',
    Describe: '',

  }, {
    Raw: 'yamano kitsune',
    Name: '矢间野狐',
    Describe: '',

  }, {
    Raw: 'yamanobe kitta',
    Name: 'やまのべきった',
    Describe: '',

  }, {
    Raw: 'shishoku gankou',
    Name: '紫色雁行',
    Describe: '',

  }, {
    Raw: 'nakagawa you',
    Name: '中川优',
    Describe: '',

  }, {
    Raw: 'matsutou tomoki',
    Name: '松任知基',
    Describe: '',

  }, {
    Raw: 'kamakiri',
    Name: 'カマキリ',
    Describe: '',

  }, {
    Raw: 'kurikara',
    Name: '倶梨伽罗',
    Describe: '',

  }, {
    Raw: 'lazy club',
    Name: 'LAZYCLUB',
    Describe: '',

  }, {
    Raw: 'amano koyo',
    Name: '天乃红叶',
    Describe: '',

  }, {
    Raw: 'hindenburg',
    Name: 'ひんでんブルグ',
    Describe: '',

  }, {
    Raw: 'kamidera chizu',
    Name: '神寺千寿',
    Describe: '',

  }, {
    Raw: 'kanou soukyuu',
    Name: '狩野苍穹',
    Describe: '',

  }, {
    Raw: 'kurokawa mio',
    Name: '黒河澪',
    Describe: '',

  }, {
    Raw: 'mizukami ranmaru',
    Name: '水上兰丸',
    Describe: '',

  }, {
    Raw: 'ogawa kanran',
    Name: 'おがわ甘藍',
    Describe: '',

  }, {
    Raw: 'orizumeda nyoizou',
    Name: '折诘田如意三',
    Describe: '',

  }, {
    Raw: 'tanaka juice',
    Name: '田中十酢',
    Describe: '',

  }, {
    Raw: 'tom tamio',
    Name: '都夢たみお',
    Describe: '',

  }, {
    Raw: 'tsukamoto miei',
    Name: '塚本ミエイ',
    Describe: '',

  }, {
    Raw: 'unno hotaru',
    Name: '海野萤',
    Describe: '',

  }, {
    Raw: 'watanabe wataru',
    Name: 'わたなべわたる',
    Describe: '',

  }, {
    Raw: 'ikegami akane',
    Name: '池上茜',
    Describe: '',

  }, {
    Raw: 'gujira',
    Name: 'ぐじら',
    Describe: '',

  }, {
    Raw: 'xierra099',
    Name: 'Xierra099',
    Describe: '',

  }, {
    Raw: 'inazuma',
    Name: 'INAZUMA',
    Describe: '',

  }, {
    Raw: 'tomatto',
    Name: 'とまっと',
    Describe: '',

  }, {
    Raw: 'gabri-l',
    Name: '雅舞罹-L',
    Describe: '',

  }, {
    Raw: 'amagaeru',
    Name: 'あまがえる',
    Describe: '',

  }, {
    Raw: 'batta',
    Name: 'Batta',
    Describe: '',

  }, {
    Raw: 'cyocyo',
    Name: 'ちょちょ',
    Describe: '',

  }, {
    Raw: 'emons',
    Name: 'えもんず',
    Describe: '',

  }, {
    Raw: 'saryuu',
    Name: '沙流',
    Describe: '',

  }, {
    Raw: 'tamano kedama',
    Name: '玉之けだま',
    Describe: '',

  }, {
    Raw: 'yumano yuuki',
    Name: '有間乃ユウキ',
    Describe: '',

  }, {
    Raw: 'kink',
    Name: 'きんく',
    Describe: '',

  }, {
    Raw: 'kamen no hito',
    Name: '仮面之人',
    Describe: '',

  }, {
    Raw: 'hakuyagen',
    Name: '白夜弦',
    Describe: '',
    externalLinks: '[pixiv](https://www.pixiv.net/member.php?id=3147599)'
  }, {
    Raw: 'kugami angning',
    Name: '九神杏仁',
    Describe: '',

  }, {
    Raw: 'yanagi asahi',
    Name: '夜凪朝妃',
    Describe: '',

  }, {
    Raw: 'tanaka shoutarou',
    Name: '田中松太郎',
    Describe: '',

  }, {
    Raw: 'nuko yarou',
    Name: 'ぬこやろう',
    Describe: '',

  }, {
    Raw: 'kaniya shiku',
    Name: '蟹屋しく',
    Describe: '',

  }, {
    Raw: 'suzushiro atsushi',
    Name: '铃城敦',
    Describe: '',

  }, {
    Raw: 'denjarasu yamada',
    Name: 'やまだ',
    Describe: '',
    externalLinks: '[pixiv](https://www.pixiv.net/member.php?id=3514185)'
  }, {
    Raw: 'sakura puchilo',
    Name: 'さくらぷちろー',
    Describe: '',

  }, {
    Raw: 'shuko',
    Name: 'SHUKO',
    Describe: '',

  }, {
    Raw: 'todoroki',
    Name: '轰',
    Describe: '',

  }, {
    Raw: 'kitamura kouichi',
    Name: '奇田村光一',
    Describe: '',

  }, {
    Raw: 'jabara tornado',
    Name: '蛇腹トルネード',
    Describe: '',

  }, {
    Raw: 'kuroda mutu',
    Name: '黑田陆奥',
    Describe: '',

  }, {
    Raw: 'hoyoyo',
    Name: 'ほよよ',
    Describe: '',

  }, {
    Raw: 'aoi tiduru',
    Name: '葵井ちづる',
    Describe: '',

  }, {
    Raw: 'agawa ryo',
    Name: '阿川椋',
    Describe: '',

  }, {
    Raw: 'nise kurosaki',
    Name: '偽くろさき',
    Describe: '',

  }, {
    Raw: 'catapult',
    Name: 'かたぱると',
    Describe: '',

  }, {
    Raw: 'kizuki akizuki',
    Name: 'きづきあきづき',
    Describe: '',

  }, {
    Raw: 'low',
    Name: 'Low',
    Describe: '',

  }, {
    Raw: 'murakami takashi',
    Name: '村上隆史',
    Describe: '',

  }, {
    Raw: 'natsukawa fuyu',
    Name: '夏川冬',
    Describe: '',

  }, {
    Raw: 'tetsu',
    Name: 'てつ',
    Describe: '',

  }, {
    Raw: 'fuji shinobu',
    Name: '藤忍',
    Describe: '',

  }, {
    Raw: 'himehachi',
    Name: 'ひめはち',
    Describe: '',

  }, {
    Raw: 'kurita yuugo',
    Name: '栗田勇午',
    Describe: '',

  }, {
    Raw: 'mihoshi kurage',
    Name: '海星海月',
    Describe: '',

  }, {
    Raw: 'mikage baku',
    Name: '御影獏',
    Describe: '',

  }, {
    Raw: 'sakurai uta',
    Name: '樱井U太',
    Describe: '',

  }, {
    Raw: 'ayase mai',
    Name: 'あやせまい',
    Describe: '',

  }, {
    Raw: 'kishibe',
    Name: '岸边',
    Describe: '',

  }, {
    Raw: 'sake',
    Name: '鲑',
    Describe: '',

  }, {
    Raw: 'takizawa naia',
    Name: '滝沢ナイア',
    Describe: '',

  }, {
    Raw: 'hirugohan',
    Name: '昼ごはん',
    Describe: '',

  }, {
    Raw: 'izumi rin',
    Name: '和泉凛',
    Describe: '',

  }, {
    Raw: 'kamijou noboru',
    Name: '上上上',
    Describe: '',

  }, {
    Raw: 'matsutaka zon',
    Name: '松鷹ぞん',
    Describe: '',

  }, {
    Raw: 'mukaibi aoi',
    Name: '向井弥・葵',
    Describe: '',

  }, {
    Raw: 'takane nohana',
    Name: 'たかねのはな',
    Describe: '',

  }, {
    Raw: 'yokoyama chicha',
    Name: 'よこやまちちゃ',
    Describe: '',

  }, {
    Raw: 'yuuma',
    Name: '祐马 | ゆーま',
    Describe: '',
    externalLinks: '[祐马的 pixiv](https://www.pixiv.net/member.php?id=1922577) [ゆーま的 pixiv](https://www.pixiv.net/member.php?id=222275)'
  }, {
    Raw: 'koide nao',
    Name: '小出奈央',
    Describe: '',

  }, {
    Raw: 'ueyama you',
    Name: 'Ueyama You',
    Describe: '',

  }, {
    Raw: 'umino luka',
    Name: '海野留珈',
    Describe: '',

  }, {
    Raw: 'kabocha',
    Name: '南瓜',
    Describe: '',

  }, {
    Raw: 'kaidou kazuki',
    Name: '海道阔毅',
    Describe: '',

  }, {
    Raw: 'nishikawa kouto',
    Name: '西川孔人',
    Describe: '',

  }, {
    Raw: 'torosawa',
    Name: 'とろさわ',
    Describe: '',

  }, {
    Raw: 'sekira ame',
    Name: 'せきらあめ',
    Describe: '',

  }, {
    Raw: 'koaya aco',
    Name: 'コアヤアコ',
    Describe: '',

  }, {
    Raw: 'yagami shuuichi',
    Name: '八神秋一',
    Describe: '',

  }, {
    Raw: 'aimaitei umami',
    Name: '愛昧亭うまみ',
    Describe: '',

  }, {
    Raw: 'ohara hiroki',
    Name: '绪原博绮',
    Describe: '',

  }, {
    Raw: 'hanaduka ryouji',
    Name: '华塚良治',
    Describe: '',

  }, {
    Raw: 'komine tsubasa',
    Name: '小峯つばさ',
    Describe: '',

  }, {
    Raw: 'arikawa katokichi',
    Name: 'ありかわかときち',
    Describe: '',

  }, {
    Raw: 'branshea',
    Name: 'ブランシェア',
    Describe: '',

  }, {
    Raw: 'hiruma kouji',
    Name: 'ひるまこうじ',
    Describe: '',

  }, {
    Raw: 'kyon',
    Name: 'きょん',
    Describe: '',

  }, {
    Raw: 'minami tomoko',
    Name: '南智子',
    Describe: '',

  }, {
    Raw: 'misaki yukihiro',
    Name: '岬ゆきひろ',
    Describe: '',

  }, {
    Raw: 'ajishio',
    Name: 'アジシオ',
    Describe: '',

  }, {
    Raw: 'basara',
    Name: 'バサラ',
    Describe: '',

  }, {
    Raw: 'terada zukeo',
    Name: '寺田ヅケ夫',
    Describe: '',

  }, {
    Raw: 'nekomaru',
    Name: '猫丸',
    Describe: '',

  }, {
    Raw: 'yuzumiya mono',
    Name: '柚宫MoNo',
    Describe: '',

  }, {
    Raw: 'ginhaha',
    Name: 'ぎんハハ',
    Describe: '',

  }, {
    Raw: 'kiken shisou',
    Name: '危险思想',
    Describe: '',

  }, {
    Raw: 'dokokano aitsu',
    Name: '何処乃アイツ',
    Describe: '',

  }, {
    Raw: 'ginyoku screw',
    Name: '銀欲スクリュー',
    Describe: '',

  }, {
    Raw: 'hg chagawa',
    Name: 'HG茶川',
    Describe: '',

  }, {
    Raw: 'john sitch-oh',
    Name: 'ジョン湿地王',
    Describe: '',

  }, {
    Raw: 'kamitani',
    Name: 'カミタニ',
    Describe: '',

  }, {
    Raw: 'nico pun nise',
    Name: '笑花伪',
    Describe: '',

  }, {
    Raw: 'okina saina',
    Name: '冲那彩菜',
    Describe: '',

  }, {
    Raw: 'sonomiya ponta',
    Name: '想乃宮ぽん太',
    Describe: '',

  }, {
    Raw: 'tendou itto',
    Name: '天童一斗',
    Describe: '',

  }, {
    Raw: 'araki kyouya',
    Name: '荒木京也',
    Describe: '',

  }, {
    Raw: 'bunchin',
    Name: 'ぶんちん',
    Describe: '',

  }, {
    Raw: 'don shigeru',
    Name: 'DON繁',
    Describe: '',

  }, {
    Raw: 'dorei jackie',
    Name: '奴隷ジャッキー',
    Describe: '',

  }, {
    Raw: 'drill murata',
    Name: 'ドリルムラタ',
    Describe: '',

  }, {
    Raw: 'kira hiroyoshi',
    Name: '吉良广义',
    Describe: '',

  }, {
    Raw: 'koshow showshow',
    Name: '故障少将',
    Describe: '',

  }, {
    Raw: 'shiromi kazuhisa',
    Name: 'しろみかずひさ',
    Describe: '',

  }, {
    Raw: 'yukarigawa yumiya',
    Name: '紫川弓夜',
    Describe: '',

  }, {
    Raw: 'eric w. schwartz',
    Name: 'Eric W. Schwartz',
    Describe: '',

  }, {
    Raw: 'x pierrot',
    Name: 'Xぴえろ',
    Describe: '',
    externalLinks: '[pixiv](https://www.pixiv.net/member.php?id=13381612)'
  }, {
    Raw: 'minust',
    Name: 'minusT',
    Describe: '',
    externalLinks: '[pixiv](https://www.pixiv.net/member.php?id=15772166)'
  }, {
    Raw: 'irohakaede',
    Name: 'イロハカエデ',
    Describe: '',
    externalLinks: '[pixiv](https://www.pixiv.net/member.php?id=11484862)'
  }, {
    Raw: 'miwatari renge',
    Name: '美渡れんげ',
    Describe: '',

  }, {
    Raw: 'satofuji masato',
    Name: '了藤诚仁',
    Describe: '',

  }, {
    Raw: 'yoshi hyuuma',
    Name: '吉飞雄马',
    Describe: '',

  }, {
    Raw: 'yuri ai',
    Name: '悠理爱',
    Describe: '',

  }, {
    Raw: 'yamakumo',
    Name: '山云',
    Describe: '',

  }, {
    Raw: 'purin purin',
    Name: 'プリンプリン',
    Describe: '',

  }, {
    Raw: 'aoki ume',
    Name: '蒼樹うめ',
    Describe: '',

  }, {
    Raw: 'nekosawaritai',
    Name: '猫泽鲤鲷',
    Describe: '',

  }, {
    Raw: 'raidon',
    Name: '来钝',
    Describe: '',

  }, {
    Raw: 'namaniku atk',
    Name: 'なまにくATK',
    Describe: '',

  }, {
    Raw: 'kumaco',
    Name: 'くまこ',
    Describe: '',

  }, {
    Raw: 'kuroshibe',
    Name: 'クロシベ',
    Describe: '',

  }, {
    Raw: 'akise',
    Name: '秋濑',
    Describe: '',

  }, {
    Raw: 'fukuguri yuuto',
    Name: '福栗悠斗',
    Describe: '',

  }, {
    Raw: 'futaba yae',
    Name: '双叶八重',
    Describe: '',

  }, {
    Raw: 'koorizu',
    Name: 'コオリズ',
    Describe: '',

  }, {
    Raw: 'kumataro',
    Name: '隈太郎',
    Describe: '',

  }, {
    Raw: 'mokkouyou bond',
    Name: '木工用ボンド',
    Describe: '',

  }, {
    Raw: 'mustang r',
    Name: 'マスタングR',
    Describe: '',

  }, {
    Raw: 'nanakagi satoshi',
    Name: '七键智志',
    Describe: '',

  }, {
    Raw: 'saba ibaru',
    Name: '佐羽いばる',
    Describe: '',

  }, {
    Raw: 'takuwan',
    Name: 'たくわん',
    Describe: '',

  }, {
    Raw: 'tsukiwani',
    Name: '月わに',
    Describe: '',

  }, {
    Raw: 'jyun',
    Name: 'JYUN',
    Describe: '',

  }, {
    Raw: 'nokoppa',
    Name: 'のこっぱ',
    Describe: '',

  }, {
    Raw: 'aru ra une',
    Name: 'アル・ラ・ウネ',
    Describe: '',

  }, {
    Raw: 'aranasi',
    Name: '新良梨',
    Describe: '',

  }, {
    Raw: 'maki yoshitaka',
    Name: '真木佳刚',
    Describe: '',

  }, {
    Raw: 'kokuten kazuma',
    Name: '国天カズマ',
    Describe: '',

  }, {
    Raw: 'fangcat',
    Name: 'FangCat',
    Describe: '',
    externalLinks: '[pixiv](https://www.pixiv.net/member.php?id=1122873)'
  }, {
    Raw: 'wtk',
    Name: 'WTK',
    Describe: '',

  }, {
    Raw: 'as109',
    Name: 'As109',
    Describe: '',

  }, {
    Raw: 'jm',
    Name: 'JM',
    Describe: '',
    externalLinks: '[pixiv](http://www.pixiv.net/member.php?id=7603871)'
  }, {
    Raw: 'breakrabbit',
    Name: 'Breakrabbit',
    Describe: '',
    externalLinks: '[pixiv](https://www.pixiv.net/member.php?id=15063072)'
  }, {
    Raw: 'farg',
    Name: 'Farg',
    Describe: '',
    externalLinks: '[pixiv](https://www.pixiv.net/member.php?id=23936891)'
  }, {
    Raw: 'yamamoto zenzen',
    Name: '山本善々',
    Describe: '',

  }, {
    Raw: 'miyata ichimi',
    Name: '宫田一海',
    Describe: '',

  }, {
    Raw: 'kumak',
    Name: 'KUMAK',
    Describe: '',

  }, {
    Raw: 'neneru',
    Name: 'ねねる',
    Describe: '',

  }, {
    Raw: 'orange bull',
    Name: '牛橘',
    Describe: '',

  }, {
    Raw: 'ipuu',
    Name: '伊菩',
    Describe: '原名イプー',
    externalLinks: '[pixiv](https://www.pixiv.net/member.php?id=80438)'
  }, {
    Raw: 'ohayou-san',
    Name: 'おはようさん（翁さい）',
    Describe: '',

  }, {
    Raw: 'nadeneko ponia',
    Name: '撫狸ぽにあ',
    Describe: '',

  }, {
    Raw: 'harukoubou norimaki',
    Name: '春工房のりまき',
    Describe: '',

  }, {
    Raw: 'forester',
    Name: 'ふぉれすた',
    Describe: '',

  }, {
    Raw: 'metal owl',
    Name: 'Metal Owl',
    Describe: '',

  }, {
    Raw: 'ozaki miray',
    Name: '尾崎未来',
    Describe: '',

  }, {
    Raw: 'madcat',
    Name: 'Madcat',
    Describe: '',

  }, {
    Raw: 'shinooka homare',
    Name: '篠岡ほまれ',
    Describe: '',

  }, {
    Raw: 'uruujima call',
    Name: 'うるう島呼音',
    Describe: '',

  }, {
    Raw: 'koizumi amane',
    Name: '恋泉天音',
    Describe: '',
    externalLinks: '[Twitter](https://twitter.com/amane_koizumi)'
  }, {
    Raw: 'stikyfinkaz-003',
    Name: 'StikyfinkaZ-003',
    Describe: '',

  }, {
    Raw: 'rokuwa',
    Name: '白鹭六羽',
    Describe: '',

  }, {
    Raw: 'sato daiji',
    Name: '大慈',
    Describe: '',

  }, {
    Raw: 'akeno minato',
    Name: '绯野湊',
    Describe: '',

  }, {
    Raw: 'hanabana tsubomi',
    Name: '華々つぼみ',
    Describe: '',

  }, {
    Raw: 'soyosoyo',
    Name: 'SOYOSOYO',
    Describe: '',

  }, {
    Raw: 'sasorigatame',
    Name: 'さそりがため',
    Describe: '',

  }, {
    Raw: 'chong wuxin',
    Name: '虫无心',
    Describe: '',

  }, {
    Raw: 'shiitakemiya donco',
    Name: '椎茸宮どんこ',
    Describe: '',

  }, {
    Raw: 'minase kuru',
    Name: '水瀬くうる',
    Describe: '',

  }, {
    Raw: 'miwa futaba',
    Name: '三輪フタバ',
    Describe: '',

  }, {
    Raw: 'arano oki',
    Name: '荒野冲',
    Describe: '',

  }, {
    Raw: 'nekotewi',
    Name: 'ねこてゐ',
    Describe: '',

  }, {
    Raw: 'ohisashiburi',
    Name: 'お久しぶり',
    Describe: '',

  }, {
    Raw: 'tsushima zan',
    Name: '津嶋ザン',
    Describe: '',

  }, {
    Raw: 'tsuda nanafushi',
    Name: '津田七节',
    Describe: '',

  }, {
    Raw: 'tokuni mirashichi',
    Name: '戸国みらしち',
    Describe: '',

  }, {
    Raw: 'ganari ryu',
    Name: 'がなり龍',
    Describe: '',

  }, {
    Raw: 'ayuya',
    Name: 'あゆや',
    Describe: '',

  }, {
    Raw: 'kagato',
    Name: '加画都',
    Describe: '',

  }, {
    Raw: 'ki-you',
    Name: '贵勇',
    Describe: '',

  }, {
    Raw: 'koujima tenro',
    Name: '向島てんろ',
    Describe: '',

  }, {
    Raw: 'natsume fumika',
    Name: '夏目文花',
    Describe: '',

  }, {
    Raw: 'potekoro',
    Name: 'ぽてころ',
    Describe: '',

  }, {
    Raw: 'yukawa asami',
    Name: '由河朝巳',
    Describe: '',

  }, {
    Raw: 'alto seneka',
    Name: '或十せねか',
    Describe: '',

  }, {
    Raw: 'doi sakazaki',
    Name: '土居坂崎',
    Describe: '',

  }, {
    Raw: 'dowarukofu',
    Name: 'どわるこふ',
    Describe: '',

  }, {
    Raw: 'isono toshiaki',
    Name: '磯野としあき',
    Describe: '',

  }, {
    Raw: 'kakogawa tarou',
    Name: '加古川太郎',
    Describe: '',

  }, {
    Raw: 'kokoromi shingon',
    Name: 'こころみ真言',
    Describe: '',

  }, {
    Raw: 'komori ei',
    Name: '古森詠',
    Describe: '',

  }, {
    Raw: 'mashue',
    Name: 'Mashue',
    Describe: '',

  }, {
    Raw: 'matsuzawa kei',
    Name: '松沢慧',
    Describe: '',

  }, {
    Raw: 'oohashi takayuki',
    Name: 'オオハシタカユキ',
    Describe: '',

  }, {
    Raw: 'rollpan2',
    Name: 'Roll-Pants',
    Describe: '',

  }, {
    Raw: 'rusty soul',
    Name: 'ラスティソウル',
    Describe: '',

  }, {
    Raw: 'sakaki shiori',
    Name: 'さかき栞',
    Describe: '',

  }, {
    Raw: 'shibahara gotyo',
    Name: 'しばはらごちょ',
    Describe: '',

  }, {
    Raw: 'sas',
    Name: 'SAS',
    Describe: '',

  }, {
    Raw: 'uyuu atsuno',
    Name: '烏有あつの',
    Describe: '',

  }, {
    Raw: 'iguchi sentarou',
    Name: '井口千太郎',
    Describe: '',

  }, {
    Raw: 'oborogumo takamitsu',
    Name: '朧雲たかみつ',
    Describe: '',

  }, {
    Raw: 'aoi kumiko',
    Name: '葵久美子',
    Describe: '',

  }, {
    Raw: 'noripachi',
    Name: 'のりパチ',
    Describe: '',

  }, {
    Raw: 'hatokonro',
    Name: '鳩こんろ',
    Describe: '',

  }, {
    Raw: 'abe yoshitoshi',
    Name: '安倍吉俊',
    Describe: '',

  }, {
    Raw: 'son hee-joon',
    Name: '손희준',
    Describe: '',

  }, {
    Raw: 'herurun',
    Name: 'へるるん',
    Describe: '',

  }, {
    Raw: 'hoshino',
    Name: '星乃',
    Describe: '',

  }, {
    Raw: 'zyugoya',
    Name: '十五夜',
    Describe: '',

  }, {
    Raw: 'yamaoka koutetsurou',
    Name: '山冈钢铁郎',
    Describe: '',

  }, {
    Raw: 'henreader',
    Name: 'へんりいだ',
    Describe: '',

  }, {
    Raw: '47agdragon',
    Name: '47AgDragon',
    Describe: '',

  }, {
    Raw: 'josho isamu',
    Name: '城所委佐武',
    Describe: '',

  }, {
    Raw: 'ogipote',
    Name: '荻pote',
    Describe: '',

  }, {
    Raw: 'marimofu',
    Name: 'まりもふ',
    Describe: '',

  }, {
    Raw: 'alison',
    Name: 'ALISON',
    Describe: '',

  }, {
    Raw: 'shimajirou',
    Name: '岛次郎',
    Describe: '',

  }, {
    Raw: 'kazuharu kina',
    Name: '和遥キナ',
    Describe: '',

  }, {
    Raw: 'ponta',
    Name: 'PoN太',
    Describe: '',

  }, {
    Raw: 'akisora',
    Name: '秋穹',
    Describe: '',

  }, {
    Raw: 'tanishi mitsuru',
    Name: 'タニシミツル',
    Describe: '',

  }, {
    Raw: 'mizuno koori',
    Name: '水乃コオリ',
    Describe: '',

  }, {
    Raw: 'akaiguppy',
    Name: '全红白子',
    Describe: '',

  }, {
    Raw: 'etuzan jakusui',
    Name: '越山弱衰',
    Describe: '',

  }, {
    Raw: 'eiji',
    Name: 'Eiジ',
    Describe: '',

  }, {
    Raw: 'oryou',
    Name: 'おりょう',
    Describe: '',

  }, {
    Raw: 'waguchi shouka',
    Name: '和口昇火',
    Describe: '',

  }, {
    Raw: 'tenzen miyabi',
    Name: '天渐雅',
    Describe: '',

  }, {
    Raw: 'windart',
    Name: 'WindArt',
    Describe: '',

  }, {
    Raw: 'masaki kei',
    Name: '真崎ケイ',
    Describe: '',

  }, {
    Raw: 'mousou-kun',
    Name: 'もうそうくん',
    Describe: '',

  }, {
    Raw: 'ooishi chuuni',
    Name: '大石中二',
    Describe: '',

  }, {
    Raw: 'mitsudoue',
    Name: 'みつどうえ',
    Describe: '',

  }, {
    Raw: 'poyoyon rock',
    Name: 'ぽよよん♥ろっく',
    Describe: '',

  }, {
    Raw: 'kiyokawa nijiko',
    Name: '虚川二次子',
    Describe: '',

  }, {
    Raw: 'himuro serika',
    Name: '冰室芹夏',
    Describe: '',

  }, {
    Raw: 'nachisuke',
    Name: 'なちすけ',
    Describe: '',

  }, {
    Raw: 'kasuga mayu',
    Name: '春日まゆ',
    Describe: '',

  }, {
    Raw: 'kirimoto yuuji',
    Name: '桐下悠司',
    Describe: '',

  }, {
    Raw: 'suihei sen',
    Name: '水平线',
    Describe: '',

  }, {
    Raw: 'yuunagi',
    Name: 'ユウナギ',
    Describe: '',

  }, {
    Raw: 'jadenkaiba',
    Name: 'Jadenkaiba',
    Describe: '',

  }, {
    Raw: 'legoman',
    Name: 'Legoman',
    Describe: '',

  }, {
    Raw: 'staryume',
    Name: '星遥ゆめ',
    Describe: '',

  }, {
    Raw: 'kamifuji mikeko',
    Name: '神藤みけこ',
    Describe: '',

  }, {
    Raw: 'hekicha',
    Name: '碧茶',
    Describe: '',

  }, {
    Raw: 'nrr',
    Name: 'Nrr',
    Describe: '',

  }, {
    Raw: 'inue shinsuke',
    Name: '犬江しんすけ',
    Describe: '',

  }, {
    Raw: 'onigirikun',
    Name: 'おにぎり君',
    Describe: '',

  }, {
    Raw: 'nekosu',
    Name: 'ねこす',
    Describe: '',

  }, {
    Raw: 'akahito',
    Name: '赤人',
    Describe: '',

  }, {
    Raw: 'hanada yanochi',
    Name: '花田やのち',
    Describe: '',

  }, {
    Raw: 'kinokomushi',
    Name: 'きのこむし',
    Describe: '',

  }, {
    Raw: 'ichimura',
    Name: 'イチムラ',
    Describe: '',

  }, {
    Raw: 'crimson',
    Name: 'クリムゾン',
    Describe: '',

  }, {
    Raw: 'tanishi',
    Name: 'たにし',
    Describe: '',

  }, {
    Raw: 'akizora sawayaka',
    Name: '秋空さわやか',
    Describe: '',

  }, {
    Raw: 'izumiya otoha',
    Name: 'いづみやおとは',
    Describe: '',

  }, {
    Raw: 'minamida usuke',
    Name: '南田U助',
    Describe: '',

  }, {
    Raw: 'mizuyuki',
    Name: 'みずゆき',
    Describe: '',

  }, {
    Raw: 'nise',
    Name: '似せ',
    Describe: '',

  }, {
    Raw: 'kojirou',
    Name: 'KOJIROU!',
    Describe: '',

  }, {
    Raw: 'hidemaru',
    Name: '英丸',
    Describe: '',

  }, {
    Raw: 'hakkyou daioujou',
    Name: '发狂大往生',
    Describe: '',

  }, {
    Raw: 'blackshirtboy',
    Name: 'Blackshirtboy',
    Describe: '',

  }, {
    Raw: 'xpray',
    Name: 'Xpray',
    Describe: '',

  }, {
    Raw: 'shika yuno',
    Name: '椎架ゆの',
    Describe: '',

  }, {
    Raw: 'chouzuki maryou',
    Name: '蝶月真绫',
    Describe: '',

  }, {
    Raw: 'azarashi',
    Name: 'アザラシ',
    Describe: '',

  }, {
    Raw: 'syamonabe',
    Name: 'シャモナベ',
    Describe: '',

  }, {
    Raw: 'tyagama',
    Name: '茶釜',
    Describe: '',

  }, {
    Raw: 'tkp',
    Name: 'TKP',
    Describe: '',

  }, {
    Raw: 'yakumo ginjirou',
    Name: '八云银次郎',
    Describe: '',

  }, {
    Raw: 'namamo nanase',
    Name: 'なまもななせ',
    Describe: '',

  }, {
    Raw: 'pyon-kti',
    Name: 'ぴょん吉',
    Describe: '',

  }, {
    Raw: 'azuki yui',
    Name: '阿月唯',
    Describe: '',

  }, {
    Raw: 'minato itoya',
    Name: 'ミナトイトヤ',
    Describe: '',

  }, {
    Raw: 'shiraishinsuke',
    Name: '白石Nスケ',
    Describe: '',

  }, {
    Raw: 'soramame-san',
    Name: 'そら豆さん',
    Describe: '',

  }, {
    Raw: 'wabara hiro',
    Name: '羽原ヒロ',
    Describe: '',

  }, {
    Raw: 'synchroaki',
    Name: 'しんくろあき',
    Describe: '',

  }, {
    Raw: 'kin no tamamushi',
    Name: '金ノ玉虫',
    Describe: '',

  }, {
    Raw: 'bakayaro',
    Name: 'ばかやろう',
    Describe: '',

  }, {
    Raw: 'yamamoto hyugo',
    Name: '山本ひゅーご',
    Describe: '',

  }, {
    Raw: 'lithium',
    Name: 'Lithium',
    Describe: '',

  }, {
    Raw: 'athu',
    Name: 'Athu',
    Describe: '',

  }, {
    Raw: 'kawarajima koh',
    Name: 'かわらじま晃',
    Describe: '',

  }, {
    Raw: 'focke wolf',
    Name: 'ほっけうるふ',
    Describe: '',

  }, {
    Raw: 'rukitsura.',
    Name: 'るきつら。',
    Describe: '',

  }, {
    Raw: 'tsuchinoshita kaeru',
    Name: '土ノ下かえる',
    Describe: '',

  }, {
    Raw: 'nokobeya',
    Name: 'のこべや',
    Describe: '',

  }, {
    Raw: 'ponfaz',
    Name: 'ぽんふぁーず',
    Describe: '',

  }, {
    Raw: 'hihumi hajime',
    Name: '一二三始',
    Describe: '',

  }, {
    Raw: 'momoyama jirou',
    Name: '桃山ジロウ',
    Describe: '',

  }, {
    Raw: 'r5',
    Name: 'R5',
    Describe: '',

  }, {
    Raw: 'c2',
    Name: 'C2',
    Describe: '',

  }, {
    Raw: 'shitappa',
    Name: 'したっぱ',
    Describe: '',

  }, {
    Raw: 'kanbayashi takaki',
    Name: '神林タカキ',
    Describe: '',

  }, {
    Raw: 'nyx',
    Name: 'にゅくす',
    Describe: '',

  }, {
    Raw: 'akaxia',
    Name: 'AkaXia',
    Describe: '',
    externalLinks: '[pixiv](https://www.pixiv.net/member.php?id=7036773)'
  }, {
    Raw: 'shigeta',
    Name: 'しげた',
    Describe: '',

  }, {
    Raw: 'uminori',
    Name: 'うみのり',
    Describe: '',

  }, {
    Raw: 'yopparai oni',
    Name: '酔っ払い鬼?',
    Describe: '',

  }, {
    Raw: 'alpaca club',
    Name: 'あるぱかくらぶ',
    Describe: '',

  }, {
    Raw: 'berosu',
    Name: 'べろす',
    Describe: '',

  }, {
    Raw: 'shiri',
    Name: 'しりー',
    Describe: '',
    externalLinks: '[pixiv](https://www.pixiv.net/member.php?id=2774175)'
  }, {
    Raw: 'sekiri',
    Name: 'せきり',
    Describe: '',

  }, {
    Raw: 'midorino tanuki',
    Name: '翠野タヌキ',
    Describe: '',

  }, {
    Raw: 'kanna hisashi',
    Name: 'かんな久',
    Describe: '',

  }, {
    Raw: 'kitahara eiji',
    Name: '北原エイジ',
    Describe: '',

  }, {
    Raw: 'aoi miharu',
    Name: '蒼井ミハル',
    Describe: '',

  }, {
    Raw: 'arinotowatari',
    Name: 'ありのとわたり',
    Describe: '',

  }, {
    Raw: 'dagashi',
    Name: '駄菓子',
    Describe: '',

  }, {
    Raw: 'e-musu aki',
    Name: 'いーむす・アキ',
    Describe: '',

  }, {
    Raw: 'himeno komomo',
    Name: '姫野こもも',
    Describe: '',

  }, {
    Raw: 'kamisiro ryu',
    Name: '神代龙',
    Describe: '',

  }, {
    Raw: 'kerorin',
    Name: 'けろりん',
    Describe: '',

  }, {
    Raw: 'kenji',
    Name: 'けんじ',
    Describe: '',

  }, {
    Raw: 'knuckle curve',
    Name: 'ナックルカーブ',
    Describe: '',

  }, {
    Raw: 'koumo',
    Name: 'コーモ',
    Describe: '',

  }, {
    Raw: 'mikarin',
    Name: 'ミカリン',
    Describe: '',

  }, {
    Raw: 'minagiri',
    Name: 'ミナギリ',
    Describe: '',

  }, {
    Raw: 'nijou katame',
    Name: '二条かため',
    Describe: '',

  }, {
    Raw: 'ouchi kaeru',
    Name: '楝蛙',
    Describe: '',

  }, {
    Raw: 'sexyturkey',
    Name: 'すたーきー',
    Describe: '',

  }, {
    Raw: 'shikkarimono no takashi-kun',
    Name: 'しっかり者のタカシくん',
    Describe: '',

  }, {
    Raw: 'survival knife',
    Name: 'サバイバル刃',
    Describe: '',

  }, {
    Raw: 'wolt',
    Name: 'ヲルト',
    Describe: '',

  }, {
    Raw: 'yaki tomeito',
    Name: '焼きトマト',
    Describe: '',

  }, {
    Raw: 'ban kazuyasu',
    Name: '伴カズヤス',
    Describe: '',

  }, {
    Raw: 'kaneko toshiaki',
    Name: 'かねことしあき',
    Describe: '',

  }, {
    Raw: 'labui',
    Name: '羅ぶい',
    Describe: '',

  }, {
    Raw: 'tanaka ginji',
    Name: '田中银二',
    Describe: '',

  }, {
    Raw: 'tetsuyama kaya',
    Name: '鉄山かや',
    Describe: '',

  }, {
    Raw: 'oota takeshi',
    Name: 'おおたたけし',
    Describe: '',

  }, {
    Raw: 'sora inoue',
    Name: 'いのうえ空',
    Describe: '',

  }, {
    Raw: 'tan jiu',
    Name: '坛九',
    Describe: '',
    externalLinks: '[微博](https://weibo.com/u/1300957955)'
  }, {
    Raw: 'shigeru',
    Name: 'しげる',
    Describe: '',

  }, {
    Raw: 'akata izuki',
    Name: '亚方逸树',
    Describe: '',

  }, {
    Raw: 'matsumori shou',
    Name: '茉森晶',
    Describe: '',

  }, {
    Raw: 'dadarou',
    Name: 'だたろう',
    Describe: '',

  }, {
    Raw: 'miso tya',
    Name: 'みそ茶',
    Describe: '',

  }, {
    Raw: 'eirizo',
    Name: 'エイリゾ',
    Describe: '',

  }, {
    Raw: 'ootomo yuuki',
    Name: '大友ゆうき',
    Describe: '',

  }, {
    Raw: 'sorai shinya',
    Name: '空维深夜',
    Describe: '',

  }, {
    Raw: 'muuba',
    Name: '梦生场',
    Describe: '',

  }, {
    Raw: 'orukaniumu',
    Name: 'おるかにうむ',
    Describe: '',

  }, {
    Raw: 'izayoi no kiki',
    Name: '十六夜のキキ',
    Describe: '',

  }, {
    Raw: 'wada rco',
    Name: 'ワダアルコ',
    Describe: '',

  }, {
    Raw: 'agobitch nee-san',
    Name: 'アゴビッチ姉さん',
    Describe: '',

  }, {
    Raw: 'kito sakeru',
    Name: '鬼頭サケル',
    Describe: '',

  }, {
    Raw: 'misa wasabi',
    Name: '三左わさび',
    Describe: '',

  }, {
    Raw: 'momoduki suzu',
    Name: '桃月すず',
    Describe: '',

  }, {
    Raw: 'picao',
    Name: 'ぴかお',
    Describe: '',

  }, {
    Raw: 'girls number',
    Name: 'Girl\'s Number',
    Describe: '',

  }, {
    Raw: 'asazuki norito',
    Name: '浅月のりと',
    Describe: '',

  }, {
    Raw: 'nodoka',
    Name: '长闲',
    Describe: '',

  }, {
    Raw: 'ajiichi',
    Name: 'アジイチ',
    Describe: '',

  }, {
    Raw: 'aoihito',
    Name: '蒼い人',
    Describe: '',

  }, {
    Raw: 'namusoubyou',
    Name: '名无双描',
    Describe: '',

  }, {
    Raw: 'marushamo',
    Name: 'まるしゃも',
    Describe: '',

  }, {
    Raw: 'haruhonya',
    Name: 'はるほんや',
    Describe: '',

  }, {
    Raw: 'shinya',
    Name: 'しんや',
    Describe: '',

  }, {
    Raw: 'yonban',
    Name: 'よんばん',
    Describe: '',

  }, {
    Raw: 'nori-haru',
    Name: 'のりはる',
    Describe: '',

  }, {
    Raw: 'neko totora',
    Name: 'ねこトトラ',
    Describe: '',

  }, {
    Raw: 'wulazula',
    Name: 'うらずら',
    Describe: '',

  }, {
    Raw: 'aian',
    Name: 'あいあん',
    Describe: '',

  }, {
    Raw: 'nmo ezago',
    Name: 'ンモ=エザゴ',
    Describe: '',

  }, {
    Raw: 'mikuni atsuko',
    Name: '三国あつ子',
    Describe: '',

  }, {
    Raw: 'nekousa',
    Name: '猫兔',
    Describe: '',

  }, {
    Raw: 'shown',
    Name: 'ショーン',
    Describe: '',

  }, {
    Raw: 'shimakaze',
    Name: '岛风',
    Describe: '',

  }, {
    Raw: 'hamatyonn',
    Name: 'ハマちょん',
    Describe: '',

  }, {
    Raw: 'fukufukuan',
    Name: '福々餡',
    Describe: '',

  }, {
    Raw: 'aikawa an',
    Name: '愛川あん',
    Describe: '',

  }, {
    Raw: 'nao takami',
    Name: '尚たかみ',
    Describe: '',

  }, {
    Raw: 'okuni yoshinobu',
    Name: '小国由喜',
    Describe: '',

  }, {
    Raw: 'oreiro',
    Name: 'オレイロ',
    Describe: '',

  }, {
    Raw: 'ndc',
    Name: 'NDC',
    Describe: '',

  }, {
    Raw: 'rocket monkey',
    Name: 'ロケットモンキー',
    Describe: '',

  }, {
    Raw: 'a-teru haito',
    Name: 'A辉废都',
    Describe: '',

  }, {
    Raw: 'kusumoto toka',
    Name: '楠元とうか',
    Describe: '',

  }, {
    Raw: 'utatane hiroyuki',
    Name: 'うたたねひろゆき',
    Describe: '',

  }, {
    Raw: 'maa-kun',
    Name: 'まーくん',
    Describe: '',

  }, {
    Raw: 'chuuka naruto',
    Name: '中華なると',
    Describe: '',

  }, {
    Raw: 'area',
    Name: 'Area',
    Describe: '',

  }, {
    Raw: 'kruth666',
    Name: 'Kruth666',
    Describe: '',

  }, {
    Raw: 'f4u',
    Name: 'F4U',
    Describe: '',

  }, {
    Raw: 'higenamuchi',
    Name: 'ひげなむち',
    Describe: '',

  }, {
    Raw: 'honryo hanaru',
    Name: '本領はなる',
    Describe: '',

  }, {
    Raw: 'ichigain',
    Name: '一概',
    Describe: '',

  }, {
    Raw: 'konchiki',
    Name: 'こんちき',
    Describe: '',

  }, {
    Raw: 'namboku',
    Name: '南北',
    Describe: '',

  }, {
    Raw: 'tohzai',
    Name: '东西',
    Describe: '',

  }, {
    Raw: 'ogadenmon',
    Name: 'オガデンモン',
    Describe: '',

  }, {
    Raw: 'sakuma tsukasa',
    Name: 'さくま司',
    Describe: '',

  }, {
    Raw: 'arai togami',
    Name: '荒居栂美',
    Describe: '',

  }, {
    Raw: 'fujitsuna',
    Name: 'フジツナ',
    Describe: '',

  }, {
    Raw: 'fukuroumori',
    Name: '枭森',
    Describe: '',

  }, {
    Raw: 'yukino koreyuki',
    Name: '之之之之',
    Describe: '',

  }, {
    Raw: 'momio',
    Name: 'もみお',
    Describe: '',

  }, {
    Raw: 'vivian tian zong',
    Name: 'Vivian天纵',
    Describe: '',

  }, {
    Raw: 'sugihara',
    Name: 'すぎはら',
    Describe: '',

  }, {
    Raw: 'minagi umihito',
    Name: '深凪ウミヒト',
    Describe: '',

  }, {
    Raw: 'natsu no koucha',
    Name: '夏の紅茶',
    Describe: '',

  }, {
    Raw: 'prime',
    Name: 'Prime',
    Describe: '',

  }, {
    Raw: 'tatekawa mako',
    Name: '館川まこ',
    Describe: '',

  }, {
    Raw: 'hrd',
    Name: 'hr津',
    Describe: '',

  }, {
    Raw: 'choco-chip',
    Name: 'チョコ・チップ',
    Describe: '',

  }, {
    Raw: 'sakurai makoto',
    Name: '櫻井マコト',
    Describe: '',

  }, {
    Raw: 'kuronyan',
    Name: 'くろニャン',
    Describe: '',

  }, {
    Raw: 'moriyama yusuke',
    Name: '森山雄介',
    Describe: '',

  }, {
    Raw: 'son yohsyu',
    Name: '孙杨州',
    Describe: '',

  }, {
    Raw: 'ray-kbys',
    Name: 'Ray-Kbys',
    Describe: '',

  }, {
    Raw: 'potato',
    Name: 'POTATO',
    Describe: '',

  }, {
    Raw: 'ichihara hikari z',
    Name: '位置原光Z',
    Describe: '',

  }, {
    Raw: 'komezawa',
    Name: 'こめざわ',
    Describe: '',

  }, {
    Raw: 'mozu',
    Name: 'もず',
    Describe: '',

  }, {
    Raw: 'aoiro ichigou',
    Name: 'あお色一号',
    Describe: '',

  }, {
    Raw: 'futamine kobito',
    Name: '二峰跨人',
    Describe: '',

  }, {
    Raw: 'gennari',
    Name: 'ゲンナリ',
    Describe: '',

  }, {
    Raw: 'hanasaki tsutsuji',
    Name: '花咲つつじ',
    Describe: '',

  }, {
    Raw: 'inukami',
    Name: 'いぬかみ',
    Describe: '',

  }, {
    Raw: 'narumiya akira',
    Name: '成宫亨',
    Describe: '',

  }, {
    Raw: 'oosawara sadao',
    Name: '大童贞男',
    Describe: '',

  }, {
    Raw: 'oozorawakaba',
    Name: '大空若叶',
    Describe: '',

  }, {
    Raw: 'sugarbt',
    Name: 'sugarBt',
    Describe: '',

  }, {
    Raw: 'sunahama nosame',
    Name: '砂浜のさめ',
    Describe: '',

  }, {
    Raw: 'zakotsu',
    Name: '佐骨',
    Describe: '',

  }, {
    Raw: 'nidy-2d-',
    Name: 'Nidy-2D-',
    Describe: '',

  }, {
    Raw: 'urico take',
    Name: '瓜子たけ',
    Describe: '',

  }, {
    Raw: 'tanohito',
    Name: 'たのひと',
    Describe: '',

  }, {
    Raw: 'kouki kuu',
    Name: 'こうきくう',
    Describe: '',

  }, {
    Raw: 'engawa suguru',
    Name: 'エンガワ卓',
    Describe: '',

  }, {
    Raw: 'fuji-han',
    Name: 'ふじはん',
    Describe: '',

  }, {
    Raw: 'hayashida toranosuke',
    Name: '林田虎之助',
    Describe: '',

  }, {
    Raw: 'buchou chinke',
    Name: '部長ちんけ',
    Describe: '',

  }, {
    Raw: 'asakura kukuri',
    Name: 'アサクラククリ',
    Describe: '',

  }, {
    Raw: 'nanao naru',
    Name: '七尾奈留',
    Describe: '',

  }, {
    Raw: 'kirishima ayu',
    Name: '雾岛鲇',
    Describe: '',

  }, {
    Raw: 'keita naruzawa',
    Name: 'Keita Naruzawa',
    Describe: '',

  }, {
    Raw: 'amami sen',
    Name: '天观仙',
    Describe: '',

  }, {
    Raw: 'juujou tatami',
    Name: '十畳たたみ',
    Describe: '',

  }, {
    Raw: 'ermuzibu',
    Name: 'Ermuzibu',
    Describe: '',

  }, {
    Raw: 'gingami',
    Name: '银河味',
    Describe: '',

  }, {
    Raw: 'makino tomoe',
    Name: '槇野ともえ',
    Describe: '',

  }, {
    Raw: 'teppeki kyojin',
    Name: '铁壁巨人',
    Describe: '',

  }, {
    Raw: 'mimiyoshi',
    Name: 'みみよし',
    Describe: '',

  }, {
    Raw: 'jinsuke',
    Name: '甚助',
    Describe: '',

  }, {
    Raw: 'mushoku santaro',
    Name: '无色三太郎',
    Describe: '',

  }, {
    Raw: 'tawara hiryuu',
    Name: '俵绯龙',
    Describe: '',

  }, {
    Raw: 'marugoshi',
    Name: 'まるごし',
    Describe: '',

  }, {
    Raw: 'missbehaviour',
    Name: 'MissBehaviour',
    Describe: '',

  }, {
    Raw: 'funsexydragonball',
    Name: 'Funsexydragonball',
    Describe: '',

  }, {
    Raw: 'badonion',
    Name: 'BadOnion',
    Describe: '',

  }, {
    Raw: 'hazuki ruka',
    Name: '羽月るか',
    Describe: '',

  }, {
    Raw: 'eno tato',
    Name: '江野たと',
    Describe: '',

  }, {
    Raw: 'daiaru',
    Name: 'ダイアル',
    Describe: '',

  }, {
    Raw: 'mokusei zaijuu',
    Name: '木星在住',
    Describe: '',

  }, {
    Raw: 'kaga akuru',
    Name: '加賀あくる',
    Describe: '',

  }, {
    Raw: 'nekoaruko',
    Name: 'ねこ＠るこ',
    Describe: '',

  }, {
    Raw: 'hari senbon',
    Name: '针千本',
    Describe: '',

  }, {
    Raw: 'bang-you',
    Name: 'BANG-YOU',
    Describe: '',

  }, {
    Raw: 'bubuzuke',
    Name: 'ぶぶづけ',
    Describe: '',

  }, {
    Raw: 'gentle sasaki',
    Name: 'ジェントル佐々木',
    Describe: '',

  }, {
    Raw: 'kamina koharu',
    Name: '神无小春',
    Describe: '',

  }, {
    Raw: 'kei.',
    Name: '刑。',
    Describe: '',

  }, {
    Raw: 'mikoyan',
    Name: 'みこやん',
    Describe: '',

  }, {
    Raw: 'nuezou',
    Name: 'ヌエゾウ',
    Describe: '',

  }, {
    Raw: 'ribyuhki',
    Name: 'リブユウキ',
    Describe: '',

  }, {
    Raw: 'sgk',
    Name: 'SGK',
    Describe: '',

  }, {
    Raw: 'shinkuu tatsuya',
    Name: 'しんくうたつや',
    Describe: '',

  }, {
    Raw: 'unou',
    Name: '右脑',
    Describe: '',

  }, {
    Raw: 'yuuki shin',
    Name: '悠木しん',
    Describe: '',

  }, {
    Raw: 'harumi',
    Name: '春海',
    Describe: '',

  }, {
    Raw: 'mirei',
    Name: 'みれい',
    Describe: '',

  }, {
    Raw: 'miwa yoshikazu',
    Name: '美和美和',
    Describe: '',

  }, {
    Raw: 'wildcat',
    Name: 'ワイルドキャット',
    Describe: '',

  }, {
    Raw: 'fujita yukihisa',
    Name: '藤田幸久',
    Describe: '',

  }, {
    Raw: 'l axe',
    Name: 'L Axe',
    Describe: '',

  }, {
    Raw: 's.m.o.k.e.',
    Name: 'S.M.O.K.E.',
    Describe: '',

  }, {
    Raw: 'samurai',
    Name: 'さむらい',
    Describe: '',

  }, {
    Raw: 'kureyon',
    Name: 'くれよん',
    Describe: '',

  }, {
    Raw: 'broccoli takeda',
    Name: 'ブロッコリーたけだ',
    Describe: '',

  }, {
    Raw: 'maatsu',
    Name: 'ま～つ',
    Describe: '',

  }, {
    Raw: 'toumasu',
    Name: 'とーます',
    Describe: '',

  }, {
    Raw: 'ishikawa sae',
    Name: '石川沙绘',
    Describe: '',

  }, {
    Raw: 'nagihashi coko',
    Name: 'なぎはしここ',
    Describe: '',

  }, {
    Raw: 'u-jin',
    Name: '游人',
    Describe: '',

  }, {
    Raw: 'piripun',
    Name: 'ぴりぷん',
    Describe: '',

  }, {
    Raw: 'akabashi',
    Name: 'アカバシ',
    Describe: '',

  }, {
    Raw: 'mataro',
    Name: '魔太郎',
    Describe: '',

  }, {
    Raw: 'kekocha',
    Name: 'けこちゃ',
    Describe: '',

  }, {
    Raw: 'mogiki hayami',
    Name: '十はやみ',
    Describe: '',

  }, {
    Raw: 'the amanoja9',
    Name: 'The Amanoja9',
    Describe: '',

  }, {
    Raw: 'fumitsuki sou',
    Name: '二三月そう',
    Describe: '',

  }, {
    Raw: 'fuji hyorone',
    Name: '藤ひょろね',
    Describe: '',

  }, {
    Raw: 'hibimegane',
    Name: 'ヒビメガネ',
    Describe: '',

  }, {
    Raw: 'dekosuke 18gou',
    Name: 'デコ助18号',
    Describe: '',

  }, {
    Raw: 'geso smith',
    Name: 'ゲソスミス',
    Describe: '',

  }, {
    Raw: 'hidarite tarou',
    Name: '左手太郎',
    Describe: '',

  }, {
    Raw: 'jagayamatarawo',
    Name: 'じゃが山たらヲ',
    Describe: '',

  }, {
    Raw: 'kasei',
    Name: 'かせい',
    Describe: '',

  }, {
    Raw: 'kayanoi ino',
    Name: '茅乃井いの',
    Describe: '',

  }, {
    Raw: 'kiiroi tamago',
    Name: 'きいろいたまご',
    Describe: '',

  }, {
    Raw: 'kirihara you',
    Name: '桐原湧',
    Describe: '',

  }, {
    Raw: 'mdakoki',
    Name: 'M田K樹',
    Describe: '',

  }, {
    Raw: 'ooyoko yamaame',
    Name: '大横山饴',
    Describe: '',

  }, {
    Raw: 'ryokuchaism',
    Name: '緑茶イズム',
    Describe: '',

  }, {
    Raw: 'shiden akira',
    Name: 'しでん晶',
    Describe: '',

  }, {
    Raw: 'soborogo',
    Name: 'ソボロゴ',
    Describe: '',

  }, {
    Raw: 'syoukaki',
    Name: '消火器',
    Describe: '',

  }, {
    Raw: '1 equals 2',
    Name: '1=2',
    Describe: '',

  }, {
    Raw: 'zouo-san',
    Name: '憎恶产',
    Describe: '',

  }, {
    Raw: 'machida hiraku',
    Name: '町田ひらく',
    Describe: '',

  }, {
    Raw: 'mamezou',
    Name: 'まめぞう',
    Describe: '',

  }, {
    Raw: 'yamaya oowemon',
    Name: '山家大右卫门',
    Describe: '',

  }, {
    Raw: 'yuizaki kazuya',
    Name: 'ユイザキカズヤ',
    Describe: '',

  }, {
    Raw: 'shichimenchou',
    Name: 'しちめんちょう',
    Describe: '',

  }, {
    Raw: 'bigshine',
    Name: 'ビッグシャイン',
    Describe: '',

  }, {
    Raw: 'apoidea',
    Name: 'Apoidea',
    Describe: '',

  }, {
    Raw: 'randou',
    Name: '乱道',
    Describe: '',

  }, {
    Raw: 'midoriiro',
    Name: '緑いろ',
    Describe: '',

  }, {
    Raw: 'koukou punch',
    Name: '高校パンチ',
    Describe: '',

  }, {
    Raw: 'arai kogane',
    Name: '新井コガネ',
    Describe: '',

  }, {
    Raw: 'aoin',
    Name: 'AOIN',
    Describe: '',

  }, {
    Raw: 'takase asagiri',
    Name: '鷹瀬あさぎり',
    Describe: '',

  }, {
    Raw: 'ugaromix',
    Name: 'Ugaromix',
    Describe: '',

  }, {
    Raw: 'aizawa hiroshi',
    Name: 'あいざわひろし',
    Describe: '',

  }, {
    Raw: 'b-ginga',
    Name: 'B-银河',
    Describe: '',

  }, {
    Raw: 'nanami',
    Name: '七弥',
    Describe: '',

  }, {
    Raw: 'narumi cristear note',
    Name: '成海クリスティアーノート',
    Describe: '',

  }, {
    Raw: 'saku usako',
    Name: '佐久うさこ',
    Describe: '',

  }, {
    Raw: 'aotsu karin',
    Name: '蒼都かりん',
    Describe: '',

  }, {
    Raw: 'mori airi',
    Name: '森あいり',
    Describe: '',

  }, {
    Raw: 'mimura zaja',
    Name: '三村ざじゃ',
    Describe: '',

  }, {
    Raw: 'itomugi-kun',
    Name: '糸麦くん',
    Describe: '',

  }, {
    Raw: 'aru urara',
    Name: 'あるうらら',
    Describe: '',

  }, {
    Raw: 'sakura saku sakura',
    Name: '佐倉さくさくら',
    Describe: '',

  }, {
    Raw: 'akinaro',
    Name: 'あきなろ',
    Describe: '',

  }, {
    Raw: 'hanakawa sugar',
    Name: '花川シュガー',
    Describe: '',

  }, {
    Raw: 'urabi',
    Name: 'うらび',
    Describe: '',

  }, {
    Raw: 'kichirock',
    Name: 'キチロク',
    Describe: '',

  }, {
    Raw: 'darjeeling.',
    Name: 'だ～じりん。',
    Describe: '',

  }, {
    Raw: 'pochincoff',
    Name: 'ポチンコフ',
    Describe: '',

  }, {
    Raw: 'tamasatou',
    Name: '玉砂糖',
    Describe: '',

  }, {
    Raw: 'kogasaki yuina',
    Name: 'こがさきゆいな',
    Describe: '',

  }, {
    Raw: 'shimeji nameko',
    Name: 'しめじなめこ',
    Describe: '',

  }, {
    Raw: 'sakibashiri jiru',
    Name: '先走汁',
    Describe: '',

  }, {
    Raw: 'hayashi tugumi',
    Name: '林つぐみ',
    Describe: '',

  }, {
    Raw: 'tamura chii',
    Name: '田村ちい',
    Describe: '',

  }, {
    Raw: 'jagausa',
    Name: 'じゃがうさ',
    Describe: '',

  }, {
    Raw: 'misuroma',
    Name: 'みすろま',
    Describe: '',

  }, {
    Raw: 'kabe umari-ko',
    Name: '壁埋まり子',
    Describe: '',

  }, {
    Raw: 'cRawly',
    Name: 'くろうり',
    Describe: '',

  }, {
    Raw: 'sekiya asami',
    Name: '関谷あさみ',
    Describe: '',

  }, {
    Raw: 'nananana',
    Name: 'ナナナナ',
    Describe: '',

  }, {
    Raw: 'cafekun',
    Name: 'cafekun',
    Describe: '',
    externalLinks: '[pixiv](https://www.pixiv.net/member.php?id=533550)'
  }, {
    Raw: 'hataraki ari',
    Name: 'ハタラキ有',
    Describe: '',
    externalLinks: '[pixiv](https://www.pixiv.net/member.php?id=80155) [个人主页](http://www.hatarakiari.com/)'
  }, {
    Raw: 'kilesha',
    Name: 'きれゐしゃ',
    Describe: '',

  }, {
    Raw: 'spec',
    Name: 'SPEC',
    Describe: '',

  }, {
    Raw: 'gogocherry',
    Name: 'GOGOCHERRY',
    Describe: '',

  }, {
    Raw: 'kitajima yuuki',
    Name: '北嶋ゆうき',
    Describe: '',

  }, {
    Raw: 'renji',
    Name: '练慈',
    Describe: '',

  }, {
    Raw: 'wise speak',
    Name: 'ワイズスピーク',
    Describe: '',

  }, {
    Raw: 'ayamy',
    Name: 'あやみ',
    Describe: '',

  }, {
    Raw: 'cekonikova',
    Name: 'Cekonikova（ぐらら）',
    Describe: '',

  }, {
    Raw: 'ke-ta',
    Name: 'ke-ta',
    Describe: '以东方二次创作为主的画师\n![图](http://ehgt.org/1d/e4/1de424720c0e3c02cdff19face97f0a95744da7e-2188273-3492-2496-jpg_l.jpg)![图](http://ehgt.org/de/2b/de2be791d9789ebf27b304af9ff1d53bf58a82b2-4298976-2412-3424-jpg_l.jpg)![图](# "http://ehgt.org/c5/d5/c5d5f4dfc1ee3ab5e1120397c15e3233aa2941a9-3630806-1500-2127-png_l.jpg")![图](# "http://ehgt.org/d0/56/d05690320d78087717d2f2c8306e5b7b7f83d3f6-3951250-3468-2468-jpg_l.jpg")![图](# "http://ehgt.org/cc/1c/cc1c17b9f529c3705495ecd3785c909adf3944f2-1968325-3492-2496-jpg_l.jpg")![图](# "http://ehgt.org/33/20/3320be9c6e0a5b686a233ae01a315f466a0b2468-3887835-6874-4919-jpg_l.jpg")![图](# "http://ehgt.org/c8/a0/c8a0ba9712c84840f2afecc37d3e4553a6afca4f-5639177-6618-4926-jpg_l.jpg")![图](# "http://ehgt.org/3c/78/3c7859ba7478962b24f099f1c22d668ad553cf76-5286635-6611-4934-jpg_l.jpg")',
    externalLinks: '[pixiv](https://www.pixiv.net/member.php?id=3104565)'
  }
  ];

/**
 * Data source for the List view. This class should
 * encapsulate all logic for fetching and manipulating the displayed data
 * (including sorting, pagination, and filtering).
 */
export class ListDataSource extends DataSource<ListItem> {
  data: ListItem[] = EXAMPLE_DATA;

  constructor(private paginator: MatPaginator, private sort: MatSort) {
    super();
  }

  /**
   * Connect this data source to the table. The table will only update when
   * the returned stream emits new items.
   * @returns A stream of the items to be rendered.
   */
  connect(): Observable<ListItem[]> {
    // Combine everything that affects the rendered data into one update
    // stream for the data-table to consume.
    const dataMutations = [
      observableOf(this.data),
      this.paginator.page,
      this.sort.sortChange
    ];

    // Set the paginator's length
    this.paginator.length = this.data.length;

    return merge(...dataMutations).pipe(map(() => {
      return this.getPagedData(this.getSortedData([...this.data]));
    }));
  }

  /**
   *  Called when the table is being destroyed. Use this function, to clean up
   * any open connections or free any held resources that were set up during connect.
   */
  disconnect() {}

  /**
   * Paginate the data (client-side). If you're using server-side pagination,
   * this would be replaced by requesting the appropriate data from the server.
   */
  private getPagedData(data: ListItem[]) {
    const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
    return data.splice(startIndex, this.paginator.pageSize);
  }

  /**
   * Sort the data (client-side). If you're using server-side sorting,
   * this would be replaced by requesting the appropriate data from the server.
   */
  private getSortedData(data: ListItem[]) {
    if (!this.sort.active || this.sort.direction === '') {
      return data;
    }

    return data.sort((a, b) => {
      const isAsc = this.sort.direction === 'asc';
      switch (this.sort.active) {
        case 'Raw': return compare(a.Raw, b.Raw, isAsc);
        case 'Name': return compare(+a.Name, +b.Name, isAsc);
        case 'Describe': return compare(+a.Describe, +b.Describe, isAsc);
        default: return 0;
      }
    });
  }
}

/** Simple sort comparator for example ID/Name columns (for client-side sorting). */
function compare(a, b, isAsc) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
