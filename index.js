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
      var messageOptions = Object.keys(deliveryInfo).reduce(function(obj, key) {
        obj[key] = deliveryInfo[key];
        return obj;
      }, {});
      messageOptions.headers = header;
      require('amqp-schedule')(job.queue.connection)(deliveryInfo.exchange, deliveryInfo.routingKey, message, delay, messageOptions);
    };
    try {
      cb(null, message, header, deliveryInfo, job);
    } catch(e) { console.error(e); }
  };
};
