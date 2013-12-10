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
