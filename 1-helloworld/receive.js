#!/usr/bin/env node

var amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function(err, conn) {
  conn.createChannel(function(err, ch) {
    var queue = 'hello';

    ch.assertQueue(queue, {durable: false});
    // must declare a queue from which to consume
    
    // server will deliver messages asynchronously
    // need to provide a callback that executes when
    // RabbitMQ pushes messages to our consumer
    
    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);
    ch.consume(queue, function(msg) {
      console.log(` [x] Received ${msg.content.toString()}`);
    }, {noAck: true});
  });
});
