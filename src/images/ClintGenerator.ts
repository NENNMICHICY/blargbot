import Jimp from 'jimp';
import { BaseImageGenerator } from '../structures/BaseImageGenerator';

export class ClintGenerator extends BaseImageGenerator {
    public constructor(logger: CatLogger) {
        super(logger);
    }

    public async execute({ image }: JObject): Promise<Buffer | null> {
        if (typeof image !== 'string')
            return null;

        const avatarImg = await this.getRemoteJimp(image);
        avatarImg.resize(700, 700);
        const bgImg = await this.generateJimp(avatarImg, x => {
            x.out('-matte').out('-virtual-pixel').out('transparent');
            x.out('-distort');
            x.out('Perspective');
            x.out('0,0,0,132  700,0,330,0  0,700,0,530  700,700,330,700');
        });

        const foreground = await this.getLocalJimp('clint.png');

        const img = new Jimp(1200, 675);
        img.composite(bgImg, 782, 0);
        img.composite(foreground, 0, 0);

        return img.getBufferAsync(Jimp.MIME_PNG);
    }
}
