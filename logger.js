const _ = require('lodash');
const jsonic = require('jsonic');

class SenecaLogger {

  createEntry(args) {
    const level = args[2];
    const entry = {
      ts: new Date(args[0]),
      instance: this.getInstanceName(args[1]),
      level: level
    };
    switch (level) {
      case 'error':
        return this.createErrorEntry(args, entry);
      case 'debug':
        return this.createDebugEntry(args, entry);
      case 'info':
        return this.createInfoEntry(args, entry);
      default:
        return this.createUnhandled(args, 'createEntry');
    }
  }

  createUnhandled(args, message) {
    //console.log(message, args);//XXX
  }

  createInfoEntry(args) {
    return this.createUnhandled(args, 'createInfoEntry');
  }

  createErrorEntry(args, entry) {
    const payload = jsonic(args[9]);
    const service = payload.role;
    const cmd = payload.cmd;

    let client = false;
    if (_.includes(args[4], 'client$')) {
      client = true;
    }

    return _.defaults(entry, {
      type: client ? 'client-act-error' : 'service-act-error',
      service: service,
      cmd: cmd,
      payload: this.filterPayload(service, cmd, payload),
      message: args[13],
      trace: args[16]
    });
  }

  createDebugEntry(args, entry) {
    //identify user's act
    const source = _.trim(args[4]);
    //if (args[3] !== 'act' || _.includes(['root$', '-', 'web', 'mem-store/1', 'transport', 'basic'], source)) {
    if (args[3] === 'act') {
      return this.createActEntry(args, entry);
    }

    if (args[9] === 'transport') {
      return this.createTransportEntry(args, entry);
    }

    return this.createUnhandled(args, 'createDebugEntry')
  }

  createTransportEntry(args, entry) {
    return;

    const some = jsonic(args[12]);

    if (args[10] !== 'ACT') {
      return;
    }

    //service
    if (some.hook === 'listen') {
      if (args[13] === 'ADD') {
        return;
      }

      console.log(args);//XXX

      const trans = args[15];
      const event = 'service-transport-' + args[14];
      const entry = _.defaults(entry, {
        type: event,
        transport: {
          type: trans.type,
          host: trans.host,
          port: trans.port
        }
      });

      if (args[19]) {
        entry.error = args[19];
      }

      return entry;
    }

    //client
    if (some.hook === 'client') {
      console.log(args);//XXX
      const event = 'client-transport-' + args[15];
      const entry = _.defaults(entry, {
        ts: new Date(args[0]),
        type: event,
        service: _.get(args, '16.pin.role')
      });

      if (args[19]) {
        entry.error = args[19];
      }

      if (_.includes(event, ['transport-send-init'])) {
        return;
      }

      return entry;
    }

    return this.createUnhandled(args, 'createTransportEntry');
  }

  createActEntry(args, entry) {
    //is remote service/client call?
    if (!_.includes(['CLIENT', 'LISTEN'], args[11])) {
      return;
    }

    let actEntry;
    const payload = jsonic(args[8]);
    if (args[9] === 'ENTRY') {
      const service = payload.role;
      const cmd = payload.cmd;
      actEntry = {
        type: 'act-request',
        service: service,
        cmd: cmd,
        payload: this.filterPayload(service, cmd, payload)
      };
    }

    if (args[9] === 'EXIT') {
      const pins = jsonic(args[7]);
      const cmd = payload.cmd || pins.cmd;
      const service = pins.role;
      actEntry = {
        type: 'act-response',
        service: service,
        cmd: cmd,
        payload: this.filterPayload(service, cmd, payload)
      };
    }

    if(!actEntry) {
      return this.createUnhandled(args, 'crateActEntry');
    }

    actEntry.actId = args[6];

    //client
    if(args[11] === 'CLIENT') {
      //console.log(args);//XXX
      actEntry.type = 'client-' + actEntry.type;
      if(args[12] !== '-') {
        actEntry.remoteInstance = this.getInstanceName(args[12]);
      }
    }
    //service
    if (args[11] === 'LISTEN') {
      //console.log(args);//XXX
      actEntry.type = 'service-' + actEntry.type;
      actEntry.remoteInstance = this.getInstanceName(args[12]);
    }

    return _.defaults(entry, actEntry);
  }

  getInstanceName(name) {
    return name.split('/')[3];
  }

  filterPayload(service, cmd, payload) {
    return _.omit(payload, ['role', 'cmd']);
  }
}

function createErrorLog(err) {
  if (!err.seneca) {
    throw new Error('Not a seneca error');
  }

  const pattern = jsonic(err.details.pattern);

  return {
    ts: new Date(),
    type: 'act-error',
    service: pattern.role,
    cmd: pattern.cmd,
    message: err.message,
    trace: err.trace
  }
}

module.exports = {
  SenecaLogger,
  createErrorLog
};
