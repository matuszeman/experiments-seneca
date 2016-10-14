# Seneca experiments

Seneca is RPC micro-service framework which offers a way to scale out and delegate server resource intensive "commands".
When seneca command is called the callee does not know who executes the command - It could be ran on local or remote server/s.
Both command input and output is a plain JS object.

For remotely executed commands Seneca have different transport options - TCP, HTTP, AMQP, ...

This experiment tries to come up with a solution for applications with the following requirements:

* Functionality implemented as part of the application codebase can be easily extracted into services running remotely,
  and ideally this should be done with no need to refactor service consumers
* Seneca framework itself introduces some run-time overhead so use of Seneca should be avoided for locally executed
  commands and used only for commands running remotely
* Remotely running services can be scale out horizontally

__Possible advantages over 'native' seneca plugins__

* "Implement and test with existing codebase first" approach and refactor into separate service modules later if required
* Whole application can run from single machine without any remote service dependencies in development environment,
  while in production any single/multiple services can be deployed on separate server instances (matter of configuration only)
* An implementation is Seneca agnostic thus easily re-used with other frameworks/approaches later if needed
* As you would expose remote services consumed by your own application, same approach can be used for 3rd party consumers (TODO security)
* Nice OO and very well testable approach

# How to achieve this?

## Seneca concept

Related functionality/commands in Seneca can be grouped into plugins.
A plugin can optionally accept "options" plain object passed on initialization with a seneca client.
If needed, a plugin can optionally register an initialization function which is called asynchronously.
Seneca client waits for all plugins to initialize and only then calls seneca.ready() callback.

## Seneca-ready service specification

Seneca encourages to implement related set of functionality into a plugin. In no-seneca-world this could be translated into a service class methods.
Thus service class methods implement what Seneca plugin commands would implement.

Service methods needs to follow certain rules so they can be migrated into seneca plugin automatically without any refactoring:

* Service instance is stateless
* Class methods accepts one parameter only (plain object, validated by the method itself) and return plain object
* All methods are asynchronous and can be implemented as generator or using promises
  (promise implementation catches possible exceptions within the code and returns rejected promise in this case)
* Service class implements a method which accepts `options` object (plugin options) `mergeOptions(options)`
* Service class can optionally implement `init()` method which can be used to initialize the service asynchronously (seneca plugin init.)  
* Error handling does not depend on Error instance type

__Error handling__

In case of error, Seneca creates Error object locally and sets Error properties sent from remote service to this local instance.
Thus the application code should not depend on Error instance type neither error message but instead Error properties can be used to distinguish
between different error types.

__TODO__

* Consider using Boom error package for application errors
* ???

# Implementation

## Seneca ready class example

```
class ExampleService {

  constructor() {
    this.options = {
      initDelay: 2000
    };
  }

  // pass an options to the service - plain object
  // a consumer is responsible for calling this before a service is used
  mergeOptions(opts) {
    _.merge(this.options, opts);
  }

  // used to initialize this service asynchronously if needed
  // a consumer is responsible for calling this before a service is used
  init() {
    return Promise((resolve, reject) => {
        // simulates some delay for the plugin to initialize
        setTimeout(resolve, this.options.initDelay);
    });
  }

  *generatorExample(args) {
    // TODO validate args
        
    return {
        example: 'worked'
    };
  }
  
  *generatorError(args) {
    throw new Error('You generated an error');
  }
  
  promiseExample(args) {
    try {
      // TODO validate args
      
      // ... some other code which could possibly raise an synchronous exception
    
      return Promise.resolve({
        example: 'worked'
      });
    } catch(err) {
      return Promise.reject(err);
    }
  }

  promiseError(args) {
    return Promise.reject(new Error('You promised an error'));
  }
  
}
```

# Example applications

This repository implements an [crypto example application](app.js) which encrypt/decrypt specified document fields,
bcrypt hash values and further checks if provided value compares to the hash generated.

It also implements [an error example application](error-app.js) simulating various error handling.

Both applications can be run with a service implemented "locally" as part of the code base or using service proxies
which leverage seneca to call these methods remotely. Important aspect of both applications is that they work without
any modification of their sourcode with both local and seneca services.


## Installation

```
npm install
```

## Run

All application runs below should generate same console output.

### Cryto application

__Local service implementation__

The application uses local services implementations.  

```
node app-local.js
```

__Local service implementation using Seneca__

The application uses same service class instances exposed as [Seneca plugin created by SenecaFactory.createPlugin()](seneca.js)
and accessible using Seneca proxy service created using [SenecaFactory.createProxyService()](seneca.js) 

```
node app-seneca-local.js --seneca.log.quiet
```

__Remote service implementation using Seneca__

As above, the application uses Seneca to access the services, but they are deployed remotely on TCP port 10202 this time.

Start Seneca service server first - starts server listening on TCP port 10202.

```
node app-remote-services.js
```

The application
```
node app-seneca-remote.js --seneca.log.quiet
```


### Error application

__Local service implementation__

```
node error-local.js
```

__Local service implementation using Seneca__

```
node error-seneca-local.js --seneca.log.quiet
```

__Remote service implementation using Seneca__

Start Seneca service server first (same as for Crypto application) 
```
node app-remote-services.js
```

The application
```
node error-seneca-remote.js --seneca.log.quiet
```


# Logging

Seneca v2.1 logging is very confusing with no documentation at all.
Implemented logger tries to simplify end-user usage by abstracting this mess into useful log entries.

## Logger usage

```
seneca.use(require('./logger').plugin, {
    payloadFilter: { //TODO
      serviceName: {
        cmdName: {
          in: [
            'username'
            'password'
          ],
          out: [
            'user.password_digest'
          ]
        }
      }
    },
    log: function(entry) {
        console.log(entry);//XXX
    }
});
```

## Log entries implemented

Along with other parameters listed below, each log entry also includes:

* ts - Date object
* level - debug, error, ...
* instance - local seneca instance tag

### act-requests

* type: 'client-act-request' / 'service-act-request'
* service
* cmd
* payload
* remoteInstance - remote seneca instance tag (TODO not currently available for client-act-request) 

### act-response

* type: 'client-act-response' / 'service-act-response'
* service
* cmd
* payload
* remoteInstance 

### act-error

* type: 'service-act-error' / 'client-act-error'
* service
* cmd
* payload
* message
* trace

### transport-*

TODO
It's possible to monitor events e.g. when TCP connection to remote instance got connected or disconnected.
 
* connect
* reconnect
* disconnected


## Log params debug

Debug handler params:

0. timestamp
1. caller (senecaInstanceName) - ?/?/?/senecaTag
2. logLevel
3. senecaCmd
4. ?
5. direction - IN, OUT, ???
6. ?
7. pins
8. params (JSON string)
9. ?
10. msgId
11. ?
12. receiver (dir: IN '-', OUT senecaInstanceName)

### Call request

Remote:

```
{ '0': { 2016-10-12T11:57:35.533Z 'short$': undefined },
  '1': 'ou24b02k66sv/1476273454878/27764/APP-111',
  '2': 'debug',
  '3': 'act',
  '4': 'client$       ',
  '5': 'IN',
  '6': 'glxxyxft6m58/hkcwiiiazq9i',
  '7': 'role:BcryptService',
  '8': '{role:BcryptService,cmd:bcryptHash,value:TEST}',
  '9': 'ENTRY',
  '10': '(7ls2geeeo9dn)',
  '11': 'CLIENT',
  '12': '-',
  '13': '-',
  '14': undefined }  
```

Local:

```
{ '0': { 2016-10-12T12:08:11.325Z 'short$': undefined },
  '1': 'm37qtkw0gxzr/1476274090764/28333/APP-local',
  '2': 'debug',
  '3': 'act',
  '4': 'BcryptService',
  '5': 'IN',
  '6': 'bjeugkt9vp2k/4gtyqezlaxb0',
  '7': 'cmd:bcryptHash,role:BcryptService',
  '8': '{role:BcryptService,cmd:bcryptHash,value:TEST}',
  '9': 'ENTRY',
  '10': '(yoiwge1hg6ii)',
  '11': '-',
  '12': '-',
  '13': '-',
  '14': undefined }
```

### Call response

Remote:
```
{ '0': { 2016-10-12T11:57:36.575Z 'short$': undefined },
  '1': 'ou24b02k66sv/1476273454878/27764/APP-111',
  '2': 'debug',
  '3': 'act',
  '4': 'client$       ',
  '5': 'OUT',
  '6': 'glxxyxft6m58/hkcwiiiazq9i',
  '7': 'role:BcryptService',
  '8': '{hash:$2a$04$g7lJ71GhOfpInyHab1vlS.ufLmzuPQDkKjhdM53UEMBA4pSez3hoy}',
  '9': 'EXIT',
  '10': '(hkcwiiiazq9i)',
  '11': 'CLIENT',
  '12': 'cwf9rwi5t9xm/1476273454893/27756/SERVICES-111',
  '13': 1042,
  '14': '-',
  '15': undefined }
```


Local:
```
{ '0': { 2016-10-12T12:08:11.332Z 'short$': undefined },
  '1': 'm37qtkw0gxzr/1476274090764/28333/APP-local',
  '2': 'debug',
  '3': 'act',
  '4': 'BcryptService',
  '5': 'OUT',
  '6': 'bjeugkt9vp2k/4gtyqezlaxb0',
  '7': 'cmd:bcryptHash,role:BcryptService',
  '8': '{hash:$2a$04$EDs2QwlQyOkXqJ1gK2Db4e9Lsz9hVDUuwjBoHBTXMofEMMuvB4XIC}',
  '9': 'EXIT',
  '10': '(yoiwge1hg6ii)',
  '11': '-',
  '12': '-',
  '13': 7,
  '14': '-',
  '15': undefined }

```

Send init
```
{ '0': { 2016-10-12T11:57:35.536Z 'short$': undefined },
  '1': 'ou24b02k66sv/1476273454878/27764/APP-111',
  '2': 'debug',
  '3': '-',
  '4': '-',
  '5': 'ACT',
  '6': 'd6vo9alltwer/p5ulgzv006t0',
  '7': 'name:transport,plugin:define,role:seneca,seq:4,tag:undefined',
  '8': 'plugin',
  '9': 'transport',
  '10': 'ACT',
  '11': '9ltwz8rg4hrt/ssd2gkrzagh8',
  '12': 'hook:client,role:transport,type:tcp',
  '13': 'client',
  '14': 'tcp',
  '15': 'send-init',
  '16': { pin: { role: 'BcryptService' } },
  '17': 'seneca_role_BcryptService_',
  '18': 
   { type: 'tcp',
     port: 10202,
     pins: [ [Object], [Object] ],
     pg: 'role:BcryptService;role:DocCryptoService',
     id: 'pg:role:BcryptService;role:DocCryptoService,pins:[object Object],[object Object],port:10202,type:tcp',
     role: 'transport',
     hook: 'client',
     'plugin$': { name: 'client$', tag: undefined },
     'ungate$': true,
     'fatal$': true,
     'tx$': 'ssd2gkrzagh8',
     'meta$': 
      { id: '9ltwz8rg4hrt/ssd2gkrzagh8',
        tx: 'ssd2gkrzagh8',
        start: 1476273455525,
        pattern: 'hook:client,role:transport,type:tcp',
        action: '(eni979215q6p)',
        entry: true,
        chain: [],
        sync: true },
     host: '127.0.0.1',
     timeout: 5555 } }
{ '0': { 2016-10-12T11:57:35.538Z 'short$': undefined },
  '1': 'ou24b02k66sv/1476273454878/27764/APP-111',
  '2': 'debug',
  '3': '-',
  '4': '-',
  '5': 'ACT',
  '6': 'd6vo9alltwer/p5ulgzv006t0',
  '7': 'name:transport,plugin:define,role:seneca,seq:4,tag:undefined',
  '8': 'plugin',
  '9': 'transport',
  '10': 'ACT',
  '11': '9ltwz8rg4hrt/ssd2gkrzagh8',
  '12': 'hook:client,role:transport,type:tcp',
  '13': 'client',
  '14': 'tcp',
  '15': 'reconnect',
  '16': { pin: { role: 'BcryptService' } },
  '17': 'seneca_role_BcryptService_',
  '18': 
   { type: 'tcp',
     port: 10202,
     pins: [ [Object], [Object] ],
     pg: 'role:BcryptService;role:DocCryptoService',
     id: 'pg:role:BcryptService;role:DocCryptoService,pins:[object Object],[object Object],port:10202,type:tcp',
     role: 'transport',
     hook: 'client',
     'plugin$': { name: 'client$', tag: undefined },
     'ungate$': true,
     'fatal$': true,
     'tx$': 'ssd2gkrzagh8',
     'meta$': 
      { id: '9ltwz8rg4hrt/ssd2gkrzagh8',
        tx: 'ssd2gkrzagh8',
        start: 1476273455525,
        pattern: 'hook:client,role:transport,type:tcp',
        action: '(eni979215q6p)',
        entry: true,
        chain: [],
        sync: true },
     host: '127.0.0.1',
     timeout: 5555 } }
{ '0': { 2016-10-12T11:57:35.542Z 'short$': undefined },
  '1': 'ou24b02k66sv/1476273454878/27764/APP-111',
  '2': 'debug',
  '3': 'plugin',
  '4': 'client$       ',
  '5': 'ADD',
  '6': '(vtbzd5v1cjmm)',
  '7': 'cmd:close,role:seneca',
  '8': '',
  '9': undefined }
{ '0': { 2016-10-12T11:57:35.543Z 'short$': undefined },
  '1': 'ou24b02k66sv/1476273454878/27764/APP-111',
  '2': 'debug',
  '3': '-',
  '4': '-',
  '5': 'ACT',
  '6': 'd6vo9alltwer/p5ulgzv006t0',
  '7': 'name:transport,plugin:define,role:seneca,seq:4,tag:undefined',
  '8': 'plugin',
  '9': 'transport',
  '10': 'ACT',
  '11': '9ltwz8rg4hrt/ssd2gkrzagh8',
  '12': 'hook:client,role:transport,type:tcp',
  '13': 'client',
  '14': 'tcp',
  '15': 'error',
  '16': { pin: { role: 'BcryptService' } },
  '17': 'seneca_role_BcryptService_',
  '18': 
   { type: 'tcp',
     port: 10202,
     pins: [ [Object], [Object] ],
     pg: 'role:BcryptService;role:DocCryptoService',
     id: 'pg:role:BcryptService;role:DocCryptoService,pins:[object Object],[object Object],port:10202,type:tcp',
     role: 'transport',
     hook: 'client',
     'plugin$': { name: 'client$', tag: undefined },
     'ungate$': true,
     'fatal$': true,
     'tx$': 'ssd2gkrzagh8',
     'meta$': 
      { id: '9ltwz8rg4hrt/ssd2gkrzagh8',
        tx: 'ssd2gkrzagh8',
        start: 1476273455525,
        pattern: 'hook:client,role:transport,type:tcp',
        action: '(eni979215q6p)',
        entry: true,
        chain: [],
        sync: true },
     host: '127.0.0.1',
     timeout: 5555 },
  '19': 'Error: connect ECONNREFUSED 127.0.0.1:10202\n    at Object.exports._errnoException (util.js:1007:11)\n    at exports._exceptionWithHostPort (util.js:1030:20)\n    at TCPConnectWrap.afterConnect [as oncomplete] (net.js:1080:14)' }
{ '0': { 2016-10-12T11:57:35.544Z 'short$': undefined },
  '1': 'ou24b02k66sv/1476273454878/27764/APP-111',
  '2': 'debug',
  '3': '-',
  '4': '-',
  '5': 'ACT',
  '6': 'd6vo9alltwer/p5ulgzv006t0',
  '7': 'name:transport,plugin:define,role:seneca,seq:4,tag:undefined',
  '8': 'plugin',
  '9': 'transport',
  '10': 'ACT',
  '11': '9ltwz8rg4hrt/ssd2gkrzagh8',
  '12': 'hook:client,role:transport,type:tcp',
  '13': 'client',
  '14': 'tcp',
  '15': 'disconnect',
  '16': { pin: { role: 'BcryptService' } },
  '17': 'seneca_role_BcryptService_',
  '18': 
   { type: 'tcp',
     port: 10202,
     pins: [ [Object], [Object] ],
     pg: 'role:BcryptService;role:DocCryptoService',
     id: 'pg:role:BcryptService;role:DocCryptoService,pins:[object Object],[object Object],port:10202,type:tcp',
     role: 'transport',
     hook: 'client',
     'plugin$': { name: 'client$', tag: undefined },
     'ungate$': true,
     'fatal$': true,
     'tx$': 'ssd2gkrzagh8',
     'meta$': 
      { id: '9ltwz8rg4hrt/ssd2gkrzagh8',
        tx: 'ssd2gkrzagh8',
        start: 1476273455525,
        pattern: 'hook:client,role:transport,type:tcp',
        action: '(eni979215q6p)',
        entry: true,
        chain: [],
        sync: true },
     host: '127.0.0.1',
     timeout: 5555 },
  '19': 'Error: connect ECONNREFUSED 127.0.0.1:10202\n    at Object.exports._errnoException (util.js:1007:11)\n    at exports._exceptionWithHostPort (util.js:1030:20)\n    at TCPConnectWrap.afterConnect [as oncomplete] (net.js:1080:14)' }
{ '0': { 2016-10-12T11:57:36.546Z 'short$': undefined },
  '1': 'ou24b02k66sv/1476273454878/27764/APP-111',
  '2': 'debug',
  '3': '-',
  '4': '-',
  '5': 'ACT',
  '6': 'd6vo9alltwer/p5ulgzv006t0',
  '7': 'name:transport,plugin:define,role:seneca,seq:4,tag:undefined',
  '8': 'plugin',
  '9': 'transport',
  '10': 'ACT',
  '11': '9ltwz8rg4hrt/ssd2gkrzagh8',
  '12': 'hook:client,role:transport,type:tcp',
  '13': 'client',
  '14': 'tcp',
  '15': 'reconnect',
  '16': { pin: { role: 'BcryptService' } },
  '17': 'seneca_role_BcryptService_',
  '18': 
   { type: 'tcp',
     port: 10202,
     pins: [ [Object], [Object] ],
     pg: 'role:BcryptService;role:DocCryptoService',
     id: 'pg:role:BcryptService;role:DocCryptoService,pins:[object Object],[object Object],port:10202,type:tcp',
     role: 'transport',
     hook: 'client',
     'plugin$': { name: 'client$', tag: undefined },
     'ungate$': true,
     'fatal$': true,
     'tx$': 'ssd2gkrzagh8',
     'meta$': 
      { id: '9ltwz8rg4hrt/ssd2gkrzagh8',
        tx: 'ssd2gkrzagh8',
        start: 1476273455525,
        pattern: 'hook:client,role:transport,type:tcp',
        action: '(eni979215q6p)',
        entry: true,
        chain: [],
        sync: true },
     host: '127.0.0.1',
     timeout: 5555 } }
{ '0': { 2016-10-12T11:57:36.547Z 'short$': undefined },
  '1': 'ou24b02k66sv/1476273454878/27764/APP-111',
  '2': 'debug',
  '3': '-',
  '4': '-',
  '5': 'ACT',
  '6': 'd6vo9alltwer/p5ulgzv006t0',
  '7': 'name:transport,plugin:define,role:seneca,seq:4,tag:undefined',
  '8': 'plugin',
  '9': 'transport',
  '10': 'ACT',
  '11': '9ltwz8rg4hrt/ssd2gkrzagh8',
  '12': 'hook:client,role:transport,type:tcp',
  '13': 'client',
  '14': 'tcp',
  '15': 'connect',
  '16': { pin: { role: 'BcryptService' } },
  '17': 'seneca_role_BcryptService_',
  '18': 
   { type: 'tcp',
     port: 10202,
     pins: [ [Object], [Object] ],
     pg: 'role:BcryptService;role:DocCryptoService',
     id: 'pg:role:BcryptService;role:DocCryptoService,pins:[object Object],[object Object],port:10202,type:tcp',
     role: 'transport',
     hook: 'client',
     'plugin$': { name: 'client$', tag: undefined },
     'ungate$': true,
     'fatal$': true,
     'tx$': 'ssd2gkrzagh8',
     'meta$': 
      { id: '9ltwz8rg4hrt/ssd2gkrzagh8',
        tx: 'ssd2gkrzagh8',
        start: 1476273455525,
        pattern: 'hook:client,role:transport,type:tcp',
        action: '(eni979215q6p)',
        entry: true,
        chain: [],
        sync: true },
     host: '127.0.0.1',
     timeout: 5555 } }

  
```


Seneca 3.2.1

```
{ actid: '7cvcyv72o3c3/zds381ro5jry',
  msg: 
   { role: 'BcryptService',
     cmd: 'bcryptHash',
     value: 'TEST',
     'meta$': 
      { id: '7cvcyv72o3c3/zds381ro5jry',
        tx: 'zds381ro5jry',
        pattern: 'role:BcryptService',
        action: '(vwk0cb1wnlpy)',
        plugin_name: 'client$',
        plugin_tag: '-',
        start: 1476438898537,
        entry: true,
        chain: [],
        sync: true },
     'plugin$': { name: 'client$', tag: '-' },
     'tx$': 'zds381ro5jry' },
  entry: true,
  prior: [],
  gate: undefined,
  caller: undefined,
  meta: 
   { plugin_name: 'client$',
     plugin_tag: '-',
     plugin_fullname: 'client$',
     log: 
      { [Function: prepare_log_data]
        debug: [Function: prepare_log_data],
        info: [Function: prepare_log_data],
        warn: [Function: prepare_log_data],
        error: [Function: prepare_log_data],
        fatal: [Function: prepare_log_data] },
     raw: { role: 'BcryptService', 'client$': true, 'internal$': [Object] },
     sub: false,
     client: true,
     deprecate: undefined,
     args: { role: 'BcryptService' },
     rules: {},
     id: '(vwk0cb1wnlpy)',
     func: 
      { [Function: transport_client]
        id: 'pg:role:BcryptService;role:DocCryptoService,pins:[object Object],[object Object],port:10202,type:tcp' },
     pattern: 'role:BcryptService',
     msgcanon: { role: 'BcryptService' },
     priorpath: '' },
  client: true,
  listen: false,
  transport: {},
  kind: 'act',
  case: 'IN',
  level: 'debug',
  plugin_name: 'client$',
  plugin_tag: '-',
  pattern: 'role:BcryptService',
  seneca: undefined,
  when: 1476438898538 }
```
