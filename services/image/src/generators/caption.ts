import { BaseImageGenerator } from '@blargbot/image/BaseImageGenerator.js';
import { ImageWorker } from '@blargbot/image/ImageWorker.js';
import { CaptionOptions, ImageResult, TextOptions } from '@blargbot/image/types.js';
import sharp, { OverlayOptions } from 'sharp';

export class CaptionGenerator extends BaseImageGenerator<'caption'> {
    public constructor(worker: ImageWorker) {
        super('caption', worker);
    }

    public async execute({ url, top, bottom, font }: CaptionOptions): Promise<ImageResult> {
        const imgData = await sharp(await this.getRemote(url))
            .resize(800, 800, { fit: 'outside' })
            .toBuffer({ resolveWithObject: true });

        const width = imgData.info.width;
        const height = imgData.info.height / 6;
        const overlays: OverlayOptions[] = [];
        const textOptions: TextOptions = {
            font,
            width,
            height,
            fill: 'white',
            outline: ['black', 8]
        };

        if (top !== undefined) {
            overlays.push({
                input: await this.renderText(top, { ...textOptions, gravity: 'North' }),
                gravity: sharp.gravity.north
            });
        }
        if (bottom !== undefined) {
            overlays.push({
                input: await this.renderText(bottom, { ...textOptions, gravity: 'South' }),
                gravity: sharp.gravity.south
            });
        }

        return {
            data: await sharp(imgData.data).composite(overlays).png().toBuffer(),
            fileName: 'caption.png'
        };
    }
}
