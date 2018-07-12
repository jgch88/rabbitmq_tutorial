#!/usr/bin/env node

var amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function(err, conn) {
  conn.createChannel(function(err, ch) {
    var queue = 'task_queue';

    ch.assertQueue(queue, {durable: true});
    // must declare a queue from which to consume
    
    // server will deliver messages asynchronously
    // need to provide a callback that executes when
    // RabbitMQ pushes messages to our consumer
    

    ch.prefetch(1); // i'm assuming this means workers can fetch a maximum of 1 task at a time, the rest of the tasks get stuck in the queue
    
    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);

    // pretending to fake a second of work for every . in the message body as a
    // "resource intensive" task
    ch.consume(queue, function(msg) {
      var secs = msg.content.toString().split('.').length - 1;

      console.log(` [x] Received ${msg.content.toString()}`);

      setTimeout(function() {
        console.log(" [x] Done");
        // acknowledging back to the queue else server will requeue it
        ch.ack(msg);
      }, secs * 1000);
    }, {noAck: false});
    // noAck:false - ensures that if the worker dies while holding messages, the queue requeues it.
  });
});
