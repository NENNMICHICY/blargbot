import { BBTagRuntimeError } from '@bbtag/blargbot';
import { TimeSubtag } from '@bbtag/blargbot/subtags';
import moment from 'moment-timezone';

import { runSubtagTests } from '../SubtagTestSuite.js';

runSubtagTests({
    subtag: TimeSubtag,
    argCountBounds: { min: 0, max: 5 },
    cases: [
        { code: '{time}', expected: () => moment.tz('Etc/UTC').format('YYYY-MM-DDTHH:mm:ssZ'), retries: 5 },
        { code: '{time;}', expected: () => moment.tz('Etc/UTC').format('YYYY-MM-DDTHH:mm:ssZ'), retries: 5 },
        { code: '{time;;}', expected: () => moment.tz('Etc/UTC').format('YYYY-MM-DDTHH:mm:ssZ'), retries: 5 },
        { code: '{time;;;}', expected: () => moment.tz('Etc/UTC').format('YYYY-MM-DDTHH:mm:ssZ'), retries: 5 },
        { code: '{time;;;;}', expected: () => moment.tz('Etc/UTC').format('YYYY-MM-DDTHH:mm:ssZ'), retries: 5 },
        { code: '{time;;;;;}', expected: () => moment.tz('Etc/UTC').format('YYYY-MM-DDTHH:mm:ssZ'), retries: 5 },

        { code: '{time;;now}', expected: () => moment.tz('Etc/UTC').format('YYYY-MM-DDTHH:mm:ssZ'), retries: 5 },
        { code: '{time;;today}', expected: () => moment.tz('Etc/UTC').startOf('day').format('YYYY-MM-DDTHH:mm:ssZ'), retries: 5 },
        { code: '{time;;tomorrow}', expected: () => moment.tz('Etc/UTC').startOf('day').add(1, 'day').format('YYYY-MM-DDTHH:mm:ssZ'), retries: 5 },
        { code: '{time;;yesterday}', expected: () => moment.tz('Etc/UTC').startOf('day').add(-1, 'day').format('YYYY-MM-DDTHH:mm:ssZ'), retries: 5 },

        { code: '{time;X}', expected: () => moment.tz('Etc/UTC').format('X'), retries: 5 },
        { code: '{time;X;}', expected: () => moment.tz('Etc/UTC').format('X'), retries: 5 },
        { code: '{time;X;;}', expected: () => moment.tz('Etc/UTC').format('X'), retries: 5 },
        { code: '{time;X;;;}', expected: () => moment.tz('Etc/UTC').format('X'), retries: 5 },
        { code: '{time;X;;;;}', expected: () => moment.tz('Etc/UTC').format('X'), retries: 5 },
        { code: '{time;DD/MM/YYYY}', expected: () => moment.tz('Etc/UTC').format('DD/MM/YYYY'), retries: 5 },
        { code: '{time;DD/MM/YYYY;}', expected: () => moment.tz('Etc/UTC').format('DD/MM/YYYY'), retries: 5 },
        { code: '{time;DD/MM/YYYY;;}', expected: () => moment.tz('Etc/UTC').format('DD/MM/YYYY'), retries: 5 },
        { code: '{time;DD/MM/YYYY;;;}', expected: () => moment.tz('Etc/UTC').format('DD/MM/YYYY'), retries: 5 },
        { code: '{time;DD/MM/YYYY;;;;}', expected: () => moment.tz('Etc/UTC').format('DD/MM/YYYY'), retries: 5 },

        { code: '{time;;1640995200}', expected: '`Invalid date`', errors: [{ start: 0, end: 18, error: new BBTagRuntimeError('Invalid date') }] },
        { code: '{time;;1640995200;}', expected: '`Invalid date`', errors: [{ start: 0, end: 19, error: new BBTagRuntimeError('Invalid date') }] },
        { code: '{time;;1640995200;;}', expected: '`Invalid date`', errors: [{ start: 0, end: 20, error: new BBTagRuntimeError('Invalid date') }] },
        { code: '{time;;1640995200;;;}', expected: '`Invalid date`', errors: [{ start: 0, end: 21, error: new BBTagRuntimeError('Invalid date') }] },
        { code: '{time;X;1640995200}', expected: '`Invalid date`', errors: [{ start: 0, end: 19, error: new BBTagRuntimeError('Invalid date') }] },
        { code: '{time;X;1640995200;}', expected: '`Invalid date`', errors: [{ start: 0, end: 20, error: new BBTagRuntimeError('Invalid date') }] },
        { code: '{time;X;1640995200;;}', expected: '`Invalid date`', errors: [{ start: 0, end: 21, error: new BBTagRuntimeError('Invalid date') }] },
        { code: '{time;X;1640995200;;;}', expected: '`Invalid date`', errors: [{ start: 0, end: 22, error: new BBTagRuntimeError('Invalid date') }] },
        { code: '{time;DD/MM/YYYY;1640995200}', expected: '`Invalid date`', errors: [{ start: 0, end: 28, error: new BBTagRuntimeError('Invalid date') }] },
        { code: '{time;DD/MM/YYYY;1640995200;}', expected: '`Invalid date`', errors: [{ start: 0, end: 29, error: new BBTagRuntimeError('Invalid date') }] },
        { code: '{time;DD/MM/YYYY;1640995200;;}', expected: '`Invalid date`', errors: [{ start: 0, end: 30, error: new BBTagRuntimeError('Invalid date') }] },
        { code: '{time;DD/MM/YYYY;1640995200;;;}', expected: '`Invalid date`', errors: [{ start: 0, end: 31, error: new BBTagRuntimeError('Invalid date') }] },

        { code: '{time;;1640995200;X}', expected: '2022-01-01T00:00:00+00:00' },
        { code: '{time;;1640995200;X;}', expected: '2022-01-01T00:00:00+00:00' },
        { code: '{time;;1640995200;X;;}', expected: '2022-01-01T00:00:00+00:00' },
        { code: '{time;X;1640995200;X}', expected: '1640995200' },
        { code: '{time;X;1640995200;X;}', expected: '1640995200' },
        { code: '{time;X;1640995200;X;;}', expected: '1640995200' },
        { code: '{time;DD/MM/YYYY;1640995200;X}', expected: '01/01/2022' },
        { code: '{time;DD/MM/YYYY;1640995200;X;}', expected: '01/01/2022' },
        { code: '{time;DD/MM/YYYY;1640995200;X;;}', expected: '01/01/2022' },
        { code: '{time;;01/01/2022;DD/MM/YYYY}', expected: '2022-01-01T00:00:00+00:00' },
        { code: '{time;;01/01/2022;DD/MM/YYYY;}', expected: '2022-01-01T00:00:00+00:00' },
        { code: '{time;;01/01/2022;DD/MM/YYYY;;}', expected: '2022-01-01T00:00:00+00:00' },
        { code: '{time;X;01/01/2022;DD/MM/YYYY}', expected: '1640995200' },
        { code: '{time;X;01/01/2022;DD/MM/YYYY;}', expected: '1640995200' },
        { code: '{time;X;01/01/2022;DD/MM/YYYY;;}', expected: '1640995200' },
        { code: '{time;DD/MM/YYYY;01/01/2022;DD/MM/YYYY}', expected: '01/01/2022' },
        { code: '{time;DD/MM/YYYY;01/01/2022;DD/MM/YYYY;}', expected: '01/01/2022' },
        { code: '{time;DD/MM/YYYY;01/01/2022;DD/MM/YYYY;;}', expected: '01/01/2022' },

        { code: '{time;;01/01/2022;DD/MM/YYYY;Etc/UTC}', expected: '2022-01-01T00:00:00+00:00' },
        { code: '{time;;01/01/2022;DD/MM/YYYY;Etc/UTC;}', expected: '2022-01-01T00:00:00+00:00' },
        { code: '{time;X;01/01/2022;DD/MM/YYYY;Etc/UTC}', expected: '1640995200' },
        { code: '{time;X;01/01/2022;DD/MM/YYYY;Etc/UTC;}', expected: '1640995200' },
        { code: '{time;DD/MM/YYYY HH:mm;01/01/2022;DD/MM/YYYY;Etc/UTC}', expected: '01/01/2022 00:00' },
        { code: '{time;DD/MM/YYYY HH:mm;01/01/2022;DD/MM/YYYY;Etc/UTC;}', expected: '01/01/2022 00:00' },
        { code: '{time;;01/01/2022;DD/MM/YYYY;Europe/Berlin}', expected: '2021-12-31T23:00:00+00:00' },
        { code: '{time;;01/01/2022;DD/MM/YYYY;Europe/Berlin;}', expected: '2021-12-31T23:00:00+00:00' },
        { code: '{time;X;01/01/2022;DD/MM/YYYY;Europe/Berlin}', expected: '1640991600' },
        { code: '{time;X;01/01/2022;DD/MM/YYYY;Europe/Berlin;}', expected: '1640991600' },
        { code: '{time;DD/MM/YYYY HH:mm;01/01/2022;DD/MM/YYYY;Europe/Berlin}', expected: '31/12/2021 23:00' },
        { code: '{time;DD/MM/YYYY HH:mm;01/01/2022;DD/MM/YYYY;Europe/Berlin;}', expected: '31/12/2021 23:00' },
        { code: '{time;;01/01/2022;DD/MM/YYYY;America/New_York}', expected: '2022-01-01T05:00:00+00:00' },
        { code: '{time;;01/01/2022;DD/MM/YYYY;America/New_York;}', expected: '2022-01-01T05:00:00+00:00' },
        { code: '{time;X;01/01/2022;DD/MM/YYYY;America/New_York}', expected: '1641013200' },
        { code: '{time;X;01/01/2022;DD/MM/YYYY;America/New_York;}', expected: '1641013200' },
        { code: '{time;DD/MM/YYYY HH:mm;01/01/2022;DD/MM/YYYY;America/New_York}', expected: '01/01/2022 05:00' },
        { code: '{time;DD/MM/YYYY HH:mm;01/01/2022;DD/MM/YYYY;America/New_York;}', expected: '01/01/2022 05:00' },

        { code: '{time;;01/01/2022;DD/MM/YYYY;Etc/UTC;Etc/UTC}', expected: '2022-01-01T00:00:00+00:00' },
        { code: '{time;X;01/01/2022;DD/MM/YYYY;Etc/UTC;Etc/UTC}', expected: '1640995200' },
        { code: '{time;DD/MM/YYYY HH:mm;01/01/2022;DD/MM/YYYY;Etc/UTC;Etc/UTC}', expected: '01/01/2022 00:00' },
        { code: '{time;;01/01/2022;DD/MM/YYYY;Europe/Berlin;Etc/UTC}', expected: '2021-12-31T23:00:00+00:00' },
        { code: '{time;X;01/01/2022;DD/MM/YYYY;Europe/Berlin;Etc/UTC}', expected: '1640991600' },
        { code: '{time;DD/MM/YYYY HH:mm;01/01/2022;DD/MM/YYYY;Europe/Berlin;Etc/UTC}', expected: '31/12/2021 23:00' },
        { code: '{time;;01/01/2022;DD/MM/YYYY;America/New_York;Etc/UTC}', expected: '2022-01-01T05:00:00+00:00' },
        { code: '{time;X;01/01/2022;DD/MM/YYYY;America/New_York;Etc/UTC}', expected: '1641013200' },
        { code: '{time;DD/MM/YYYY HH:mm;01/01/2022;DD/MM/YYYY;America/New_York;Etc/UTC}', expected: '01/01/2022 05:00' },
        { code: '{time;;01/01/2022;DD/MM/YYYY;Etc/UTC;Europe/Berlin}', expected: '2022-01-01T01:00:00+01:00' },
        { code: '{time;X;01/01/2022;DD/MM/YYYY;Etc/UTC;Europe/Berlin}', expected: '1640995200' },
        { code: '{time;DD/MM/YYYY HH:mm;01/01/2022;DD/MM/YYYY;Etc/UTC;Europe/Berlin}', expected: '01/01/2022 01:00' },
        { code: '{time;;01/01/2022;DD/MM/YYYY;Europe/Berlin;Europe/Berlin}', expected: '2022-01-01T00:00:00+01:00' },
        { code: '{time;X;01/01/2022;DD/MM/YYYY;Europe/Berlin;Europe/Berlin}', expected: '1640991600' },
        { code: '{time;DD/MM/YYYY HH:mm;01/01/2022;DD/MM/YYYY;Europe/Berlin;Europe/Berlin}', expected: '01/01/2022 00:00' },
        { code: '{time;;01/01/2022;DD/MM/YYYY;America/New_York;Europe/Berlin}', expected: '2022-01-01T06:00:00+01:00' },
        { code: '{time;X;01/01/2022;DD/MM/YYYY;America/New_York;Europe/Berlin}', expected: '1641013200' },
        { code: '{time;DD/MM/YYYY HH:mm;01/01/2022;DD/MM/YYYY;America/New_York;Europe/Berlin}', expected: '01/01/2022 06:00' },
        { code: '{time;;01/01/2022;DD/MM/YYYY;Etc/UTC;America/New_York}', expected: '2021-12-31T19:00:00-05:00' },
        { code: '{time;X;01/01/2022;DD/MM/YYYY;Etc/UTC;America/New_York}', expected: '1640995200' },
        { code: '{time;DD/MM/YYYY HH:mm;01/01/2022;DD/MM/YYYY;Etc/UTC;America/New_York}', expected: '31/12/2021 19:00' },
        { code: '{time;;01/01/2022;DD/MM/YYYY;Europe/Berlin;America/New_York}', expected: '2021-12-31T18:00:00-05:00' },
        { code: '{time;X;01/01/2022;DD/MM/YYYY;Europe/Berlin;America/New_York}', expected: '1640991600' },
        { code: '{time;DD/MM/YYYY HH:mm;01/01/2022;DD/MM/YYYY;Europe/Berlin;America/New_York}', expected: '31/12/2021 18:00' },
        { code: '{time;;01/01/2022;DD/MM/YYYY;America/New_York;America/New_York}', expected: '2022-01-01T00:00:00-05:00' },
        { code: '{time;X;01/01/2022;DD/MM/YYYY;America/New_York;America/New_York}', expected: '1641013200' },
        { code: '{time;DD/MM/YYYY HH:mm;01/01/2022;DD/MM/YYYY;America/New_York;America/New_York}', expected: '01/01/2022 00:00' }
    ]
});
