#!/usr/bin/env node

// client here refers to the one requesting a result 
// from the rpc server

var amqp = require('amqplib/callback_api');

var args = process.argv.slice(2);

if (args.length == 0) {
  console.log("Usage: rpc_client.js num");
  process.exit(1);
}

const generateUuid = function generateUuid() {
  return Math.random().toString() + Math.random().toString() + Math.random().toString();
}

amqp.connect('amqp://localhost', function(err, conn) {
  conn.createChannel(function(err, ch) {
    // anonymous channel?
    ch.assertQueue('', {exclusive: true}, function(err, q) {
      var corr = generateUuid();
      var num = parseInt(args[0]);

      console.log(` [x] Requesting fib(${num})`);

      ch.consume(q.queue, function(msg) {
        if (msg.properties.correlationId == corr) {
          console.log(` [.] Got ${msg.content.toString()}`);
          setTimeout(function() {
            conn.close();
            process.exit(0);
          }, 500);
        }
      }, {noAck: true});

      ch.sendToQueue('rpc_queue',
        new Buffer(num.toString()),
        { correlationId: corr, replyTo: q.queue}
      );

    })
  })
})
