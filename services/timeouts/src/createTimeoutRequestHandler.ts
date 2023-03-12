import express, { asyncHandler } from '@blargbot/express';
import type { TimeoutCreateResponse, TimeoutGetResponse, TimeoutListResponse } from '@blargbot/timeouts-client';
import { timeoutDetailsCreateSerializer } from '@blargbot/timeouts-client';

import type { TimeoutService } from './TimeoutService.js';

export function createTimeoutRequestHandler(service: TimeoutService): express.RequestHandler {
    const router = express.Router();

    router.route('/:ownerId(\\d+)/timers')
        .get(asyncHandler(async (req, res): Promise<void> => {
            const offset = Number(req.query.offset ?? '0');
            const count = Number(req.query.count ?? '10');
            if (isNaN(offset) || offset < 0)
                return void res.status(400).send({ error: 'Invalid offset' });
            if (isNaN(count) || count <= 0)
                return void res.status(400).send({ error: 'Invalid count' });
            const ownerId = BigInt(req.params.ownerId);
            const [timers, total] = await Promise.all([
                service.listTimeout(ownerId, offset, count),
                service.countTimeout(ownerId)
            ]);
            res.status(200).send({ timers, total } satisfies TimeoutListResponse);
        }))
        .post(asyncHandler(async (req, res): Promise<void> => {
            const body = timeoutDetailsCreateSerializer.fromJson(req.body as JToken | undefined);
            if (!body.success)
                return void res.status(400).send({ error: 'Invalid request body' });

            const id = await service.createTimeout({
                ...body.value,
                ownerId: BigInt(req.params.ownerId)
            });
            res.status(200).send({ id } satisfies TimeoutCreateResponse);
        }))
        .delete(asyncHandler(async (req, res) => {
            await service.clearTimeout(BigInt(req.params.ownerId));
            res.status(204).end();
        }));

    router.route('/:ownerId(\\d+)/timers/:timerId')
        .get(asyncHandler(async (req, res): Promise<void> => {
            const result = await service.getTimeout(BigInt(req.params.ownerId), req.params.timerId);
            if (result === undefined)
                return void res.status(404).end();
            res.status(200).send(result satisfies TimeoutGetResponse);
        }))
        .delete(asyncHandler(async (req, res) => {
            await service.deleteTimeout(BigInt(req.params.ownerId), req.params.timerId);
            res.status(204).end();
        }));

    return router;
}
