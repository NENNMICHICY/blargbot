import { Cluster } from '../cluster';
import { BaseSubtag } from '../core/bbtag';
import { SubtagType } from '../utils';
import { AllHtmlEntities as Entities } from 'html-entities';
const entities = new Entities();

export class HtmlDecodeSubtag extends BaseSubtag {
    public constructor(
        cluster: Cluster
    ) {
        super(cluster, {
            name: 'htmldecode',
            category: SubtagType.COMPLEX,
            definition: [
                {
                    args: ['text+'],
                    description: 'Decodes html entities from `text`.',
                    exampleCode: '{htmldecode;&lt;hello, world&gt;}',
                    exampleOut: '<hello, world>',
                    execute: (_, args) => entities.decode(args.map(arg => arg.value).join(';'))
                }
            ]
        });
    }
}