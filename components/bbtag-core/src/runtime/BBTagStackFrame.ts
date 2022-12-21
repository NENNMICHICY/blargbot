import type { BBTagSubtagCall } from '../language/BBTagSubtagCall.js';
import type { SourceMarker } from '../language/SourceMarker.js';

export class BBTagStackFrame {
    public readonly subtag: BBTagSubtagCall;
    public readonly name: string;
    public readonly start: SourceMarker;
    public readonly end: SourceMarker;

    public constructor(subtag: BBTagSubtagCall, name: string) {
        this.subtag = subtag;
        this.name = name;
        this.start = subtag.start;
        this.end = subtag.end;
    }
}
