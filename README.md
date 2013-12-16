node-amqp-retry
===============

Retry failed jobs, with exponential backoff (or custom) strategy.

## Install

```
npm install amqp-retry
```

## Usage

Old code, without retry logic

```js
queue.subscribe(options, handler);
```

New, smart code

```js
var retry = require('amqp-retry');
queue.subscribe(options, retry(initialDelay, limit, handler));
```

If handler throws an error, the message will be requeued with some delay (uses [`amqp-schedule`](https://github.com/purposeindustries/node-amqp-schedule/) internally).
You can explicitly requeue the job with `job.retry()`. See [examples](https://github.com/purposeindustries/node-amqp-retry/tree/master/examples) for details.
