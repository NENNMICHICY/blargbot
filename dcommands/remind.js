var e = module.exports = {};

const moment = require('moment');

e.init = () => {
    e.category = bu.CommandType.GENERAL;
};

e.requireCtx = require;

e.isCommand = true;
e.hidden = false;
e.usage = 'remind <text> -t <time>';
e.info = 'Reminds you about something after a period of time in a DM.';
e.longinfo = '<p>Reminds you about something after a period of time in a DM.</p>';
e.alias = ['remindme'];

e.flags = [{
    flag: 't',
    word: 'time',
    desc: 'The time before the user is to be reminded, formatted as \'1 day 2 hours 3 minutes and 4 seconds\', \'1d2h3m4s\', or some other combination.'
}, {
    flag: 'c',
    word: 'channel',
    desc: 'If set, this will notify the user in current channel instead of in a DM.'
}]

e.execute = async function(msg, words, text) {
    let input = bu.parseInput(e.flags, words);
    let duration = moment.duration();
    if (input.t && input.t.length > 0) duration = bu.parseDuration(input.t.join(' '));
    if (duration.asMilliseconds() == 0) {
        await bu.send(msg, `Hey, you didn't give me a period of time to remind you after!
Example: \`remind Do a thing! -t 1 day, two hours\``);
    } else {
        let channel;
        if (input.c) channel = msg.channel.id;
        await r.table('events').insert({
            type: 'remind',
            user: msg.author.id,
            content: input.undefined.join(' '),
            channel: channel,
            starttime: r.epochTime(moment().unix()),
            endtime: r.epochTime(moment().add(duration).unix())
        });
        await bu.send(msg, `:alarm_clock: Ok! I'll remind you ${channel ? 'here' : 'in a DM'} ${duration.humanize(true)}! :alarm_clock: `);
    }
};

e.event = async function(args) {
    let duration = moment.duration(moment() - moment(args.starttime));
    duration.subtract(duration * 2);
    if (args.channel) {
        bu.send(args.channel, `:alarm_clock: Hi, <@${args.user}>! You asked me to remind you about this ${duration.humanize(true)}:
${args.content}`);
    } else {
        bu.sendDM(args.user, `:alarm_clock: Hi! You asked me to remind you about this ${duration.humanize(true)}:
${args.content}`);
    }
};