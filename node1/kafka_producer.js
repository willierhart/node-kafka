const avro = require('avsc');
const kafka = require('kafka-node');
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
var HighLevelProducer = kafka.HighLevelProducer;
var KeyedMessage = kafka.KeyedMessage;
var Client = kafka.Client;

// Client
var client = new Client('localhost:2181', 'my-client-id', {
    sessionTimeout: 300,
    spinDelay: 100,
    retries: 2
});
  
// For this demo we just log client errors to the console.
  client.on('error', function(error) {
    console.error(error);
});

// Create Producer and send message
var producer = new HighLevelProducer(client);

producer.on('ready', function() {
  //Send payload x times to Kafka and log result/error
  for(var i = 0; i < 10; i++){

    // Create message and encode to Avro buffer
    var messageBuffer = type.toBuffer({
        id: uuidv4(),
        text: "Willi Kafka " + uuidv4(),
        timestamp: Date.now(),
        /* enumField: 'sym1' */
    });

    // Create a new payload
    var payload = [{
        topic: 'webevents.dev',
        messages: messageBuffer,
        attributes: 1 /* Use GZip compression for the payload */
    }];

    producer.send(payload, function(error, result) {
        console.info('Sent payload to Kafka: ', payload);
        if (error) {
        console.error(error);
        } else {
        var formattedResult = result[0];
        console.log('result: ', result)
        }
    }
  );
}});
  setTimeout(function() { process.exit(0) }, 500);
// For this demo we just log producer errors to the console.
producer.on('error', function(error) {
  console.error(error);
});