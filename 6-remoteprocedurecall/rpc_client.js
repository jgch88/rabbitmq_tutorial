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

    // tutorial says: creates an anonymous exclusive
    // callback queue
    
    // according to channel.assertQueue docs, 
    // an empty string in the queue parameter 
    // makes the server create a random name
    // {exclusive: true} scopes the queue to the connection
    // doing rabbitmqctl list_queues doesn't show this queue
    
    // assertqueue Creates a queue if it doesn't exist
    // we're creating our own queue for us to "sub" to
    ch.assertQueue('', {exclusive: true}, function(err, q) {

      // instead of constantly opening and closing an anonymous exclusive callback queue,
      // we leave the callback queue open
      // and use correlationIds for separate requests/messages/replies

      var corr = generateUuid();
      
      // error checking for float, but no non negative validation
      var num = parseInt(args[0]);

      console.log(` [x] Requesting fib(${num})`);

      // q.queue is the randomly named queue
      // console.log(q.queue);

      ch.consume(q.queue, function(msg) {
        if (msg.properties.correlationId == corr) {
          console.log(` [.] Got ${msg.content.toString()}`);
          setTimeout(function() {
            conn.close();
            process.exit(0);
          }, 500);
        }
      }, {noAck: true});

      // we're creating a message that expects a reply
      // specifically to the queue we created in assertqueue
      ch.sendToQueue('rpc_queue',
        new Buffer(num.toString()),
        { correlationId: corr, replyTo: q.queue}
      );

    })
  })
})
