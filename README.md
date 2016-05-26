# Installation

RabbitMQ https://www.rabbitmq.com/download.html

```
npm install
```

# Run

Runs test plugin on "remote" servers showcasing different transports
```
node servers.js
```

Runs "local" client
```
node client.js
```

# Discussion

Action cache. Makes inbound messages idempotent.
https://github.com/senecajs/seneca/blob/master/seneca.js#L117
