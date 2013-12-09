module.exports = function wrapper(maxTry, initialWait, cb) {
  return function(message, header, deliveryInfo, job) {
    header.retries = header.retries || 0;
    job.retry = function() {
      header.retries++;
      if(header.retries >= maxTry) {
        return cb(new Error('Message processing failed ' + maxTry + ' times'), message, header, deliveryInfo, job);
      }
      require('amqp-schedule')(job.queue.connection)(deliveryInfo.exchange, deliveryInfo.routingKey, message, Math.pow(2, header.retries)*initialWait, {
        contentType: deliveryInfo.contentType,
        headers: header
      });
    };
    try {
      cb(null, message, header, deliveryInfo, job);
    } catch(e) { console.error(e); }
  };
};

var c = require('amqp').createConnection('amqp://localhost');
c.once('ready', function() {
  c.queue('test', function(q) {
    q.subscribe(module.exports(5, 500, function(err, message, header, deliveryInfo, job) {
      if(err) {
        return console.log(err);
      }
      console.log(message);
      job.retry();
    }));
    c.publish('test', {foo:'bar'}, { contentType: 'application/json' });
  });
});
