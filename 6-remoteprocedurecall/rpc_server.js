#!/usr/bin/env node

var amqp = require('amqplib/callback_api');

const fibonacci = function fibonacci(n) {
  if (n == 0 || n == 1) {
    return n;
  } else {
    return fibonacci(n-1) + fibonacci(n-2);
  }
}

amqp.connect('amqp://localhost', function(err, conn) {
  conn.createChannel(function(err, ch) {
    var q = 'rpc_queue';

    ch.assertQueue(q, {durable: false});
    ch.prefetch(1);
    console.log(' [x] Awaiting RPC requests');
    
    // callback function for callback involves
    // now sending to a new queue, particularly
    // the one opened up by the client where it's listening for a reply (distinguished by its (replyTo and correlationId)
    ch.consume(q, function reply(msg) {
      var n = parseInt(msg.content.toString());

      console.log(" [.] fib(%d)", n);

      var r = fibonacci(n);

      // the same sendToQueue used by the sender, now used
      // to send a reply back
      ch.sendToQueue(msg.properties.replyTo,
        new Buffer(r.toString()),
        {correlationId:msg.properties.correlationId}
      );

      ch.ack(msg);

    });
  });
});
