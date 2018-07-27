const avro = require('avsc');
const amqp = require('amqplib/callback_api');
const uuidv4 = require('uuid/v4');

var typeDescription = {
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

var type = avro.parse(typeDescription);

// Client
amqp.connect('amqp://localhost', function(err, conn) {
  conn.createChannel(function(err, ch) {
    // Create Producer and send message
    const q = 'webevents.dev'; // Queue Name
    ch.assertQueue(q, {durable: false});

    ch.consume(q, function(message) {
        var buf = new Buffer.from(message.content.toString(), 'binary'); // Read string into a buffer.
        var decodedMessage = type.fromBuffer(buf.slice(0)); // Skip prefix.
        /* console.log(decodedMessage.text); */
        console.log(decodedMessage);
    }, {noAck: true});

  });
});