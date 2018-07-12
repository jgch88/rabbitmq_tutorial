#!/usr/bin/env node

var amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function(err, conn) {
  conn.createChannel(function(err, ch) {
    var queue = 'hello';

    ch.assertQueue(queue, {durable: false});
    // must declare a queue to send to to publish a message to this queue
    // declaring a queue is idempotent - will be created only if it doesn't exist already
    ch.sendToQueue(queue, new Buffer('Hello World'));
    console.log(" [x] Sent 'Hello World'");
  });
  
  setTimeout(function() {
    conn.close();
    process.exit(0);
  }, 500);
});


