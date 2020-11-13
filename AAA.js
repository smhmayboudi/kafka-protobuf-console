const pb = require("./AAA_pb");

const aaa = new pb.AAA();
aaa.setMessage("AAA_XXX");

const data = Buffer.from(aaa.serializeBinary());

console.log("AAA", "buffer", Array.prototype.toString.call(data));

var aaaNew = pb.AAA.deserializeBinary(data);
console.log("AAA", "data.message", aaaNew.getMessage());

// ========================================
// ========================================
// ========================================
// ========================================

const DEFAULT_OFFSET = 0;

// Based on https://github.com/mtth/avsc/issues/140
// const collectInvalidPaths = (schema: Schema, jsonPayload: object) => {
//   const paths: any = [];
//   schema.isValid(jsonPayload, {
//     errorHook: (path) => paths.push(path),
//   });

//   return paths;
// };

const MAGIC_BYTE = Buffer.alloc(1);

const encode = (schema, registryId, jsonPayload) => {
  // let avroPayload;
  // try {
  //   avroPayload = schema.toBuffer(jsonPayload);
  // } catch (error) {
  //   error.paths = collectInvalidPaths(schema, jsonPayload);
  //   throw error;
  // }

  const registryIdBuffer = Buffer.alloc(4);
  registryIdBuffer.writeInt32BE(registryId, DEFAULT_OFFSET);

  // return Buffer.concat([MAGIC_BYTE, registryIdBuffer, avroPayload]);
  return Buffer.concat([MAGIC_BYTE, registryIdBuffer, data]);
};

// ========================================
// ========================================
// ========================================
// ========================================

const { Kafka } = require("kafkajs");
const kafka = new Kafka({
  brokers: ["broker:29092"],
  clientId: "my-app",
});

async function producer() {
  const producer = kafka.producer();
  await producer.connect();
  await producer.send({
    messages: [
      {
        value: encode(0, 53, 0),
      },
    ],
    topic: "AAA",
  });
  await producer.disconnect();
}
void producer();

async function consumer() {
  const consumer = kafka.consumer({
    groupId: "AAA",
  });
  await consumer.connect();
  await consumer.subscribe({
    fromBeginning: true,
    topic: "AAA",
  });
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log("topic", topic);
      console.log("partition", partition);
      console.log("message", message);
      const aaaNew = pb.AAA.deserializeBinary(message.value);
      const message2 = aaaNew.getMessage();
      console.log("DATA.message =>", message2);
    },
  });
}
// void consumer();
