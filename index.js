module.exports = function wrapper(initialWait, maxTry, cb) {
  return function(message, header, deliveryInfo, job) {
    header.retries = header.retries || 0;
    job.retry = function(wait, tries) {
      if( wait === undefined ) {
        wait = initialWait;
      }
      if(tries === undefined) {
        tries = maxTry;
      }
      var delay = wait instanceof Array ? wait[header.retries] : Math.pow(2, header.retries)*wait;
      header.retries++;
      if(header.retries >= tries) {
        return cb(new Error('Message processing failed ' + maxTry + ' times'), message, header, deliveryInfo, job);
      }
      require('amqp-schedule')(job.queue.connection)(deliveryInfo.exchange, deliveryInfo.routingKey, message, delay, {
        contentType: deliveryInfo.contentType,
        headers: header
      });
    };
    try {
      cb(null, message, header, deliveryInfo, job);
    } catch(e) { console.error(e); }
  };
};
