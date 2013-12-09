var amqp = require('amqp').createConnection('amqp://localhost');
var retry = require('amqp-retry')(amqp);

amqp.once('ready', function() {
  amqp.queue('test', function(q) {
    q.subscribe(retry(5, 500, function(err, message, headers, deliveryInfo, job) {
      if(err) {
        return console.log('Error: ', err);
      }
      console.log('message: ', message);
      job.retry();
    }));
    amqp.publish('test', {foo: 'bar'}, {contentType: 'application/json'});
  });
});
