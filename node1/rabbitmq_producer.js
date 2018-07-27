const avro = require('avsc');
const amqp = require('amqplib/callback_api');
const uuidv4 = require('uuid/v4');

var avroSchema = {
    name: 'MessageType',
    type: 'record',
    fields: [
      {
        name: 'id',
        type: 'string'
      }, {
        name: 'text',
        type: 'string'
      }, {
        name: 'timestamp',
        type: 'double'
      }, 
      /*{
        name: 'enumField',
        type: {
          name: 'EnumField',
          type: 'enum',
          symbols: ['sym1', 'sym2', 'sym3']
        }
      }*/]
};

var type = avro.parse(avroSchema);

// Client
amqp.connect('amqp://localhost', function(err, conn) {
  conn.createChannel(function(err, ch) {
    // Create Producer and send message
    const q = 'webevents.dev'; // Queue Name
    ch.assertQueue(q, {durable: false});

    //Send payload x times to RabbitMQ and log result/error
    for(var i = 0; i < 10; i++){

        // Create message and encode to Avro buffer
        var messageBuffer = type.toBuffer({
            id: uuidv4(),
            text: "Willi RabbitMQ " + uuidv4(),
            timestamp: Date.now(),
            /* enumField: 'sym1' */
        });

        ch.sendToQueue(q, messageBuffer);
        console.info('Sent payload to RabbitMQ: ', messageBuffer);
    }  
  });
  setTimeout(function() { conn.close(); process.exit(0) }, 500);
});