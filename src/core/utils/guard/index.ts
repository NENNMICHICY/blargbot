import { isGuildChannel } from './isGuildChannel';
import { isTextableChannel } from './isTextableChannel';
import { isCategoryChannel } from './isCategoryChannel';
import { isVoiceChannel } from './isVoiceChannel';
import { isPrivateChannel } from './isPrivateChannel';
import { isPrivateMessage } from './isPrivateMessage';
import { isGuildRelated } from './isGuildRelated';
import { isGuildMessage } from './isGuildMessage';
import { notUndefined } from './notUndefined';
import { notNull } from './notNull';
import { hasValue } from './hasValue';
import { checkEmbedSize } from './checkEmbedSize';
import { checkMessageSize } from './checkMessageSize';
import { isClass } from './isClass';
import { testMessageFilter } from './testMessageFilter';
import { hasProperty } from './hasProperty';
import { isLetter } from './isLetter';

export const guard = {
    isGuildChannel,
    isGuildMessage,
    isTextableChannel,
    isCategoryChannel,
    isVoiceChannel,
    isGuildRelated,
    isPrivateChannel,
    isPrivateMessage,
    notUndefined,
    notNull,
    hasValue,
    checkEmbedSize,
    checkMessageSize,
    isClass,
    testMessageFilter,
    hasProperty,
    isLetter
};
