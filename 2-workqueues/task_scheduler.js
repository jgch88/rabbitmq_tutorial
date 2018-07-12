#!/usr/bin/env node

// work queues or task queues distribute time consuming tasks among multiple workers
// main idea: avoid doing a resource intensive task immediately, by scheduling it to be done later
// one use case: cannot handle a task within a short HTTP request window

// after spamming the worker with 3x "hello world.....", it 
// seems that this method allows us to pass the task
// over to persist on the worker without worrying
// about the synchronous thing blocking the queue

var amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function(err, conn) {
  conn.createChannel(function(err, ch) {
    var queue = 'task_queue';
    // allow arbitrary messages to be sent from the command line
    
    var msg = process.argv.slice(2).join(' ') || 'Hello World';

    // durable is true now..?
    // -> Durable (the queue will survive a broker restart)
    ch.assertQueue(queue, {durable: true});
    // must declare a queue to send to to publish a message to this queue
    // declaring a queue is idempotent - will be created only if it doesn't exist already
    // persistent is true now..?
    ch.sendToQueue(queue, new Buffer(msg), {persistent: true});
    console.log(` [x] Sent '${msg}'`);
  });
  
  setTimeout(function() {
    conn.close();
    process.exit(0);
  }, 500);
});


