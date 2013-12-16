var amqp = require('amqp').createConnection('amqp://localhost');
var retry = require('../index');
//var retry = require('amqp-retry');

amqp.once('ready', function() {
  amqp.queue('test', function(q) {
    q.subscribe(retry(500, 5, function(err, message, headers, deliveryInfo, job) {
      if(err) {
        return console.log('Error: ', err);
      }
      console.log('message: ', message);
      if(Math.random() > 0.5) {
        job.retry();
      } else {
        job.retry(1000, 10); //override default delay/retry values
      }
    }));
    amqp.publish('test', {foo: 'bar'}, {contentType: 'application/json'});
  });
});
