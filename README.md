# kafka-protobuf-console

NOTE: Running services

``` bash
$ docker-compose up -d
```

NOTE: put these lines in /etc/hosts.

```bash
127.0.0.1	broker
127.0.0.1	connect
127.0.0.1	control-center
127.0.0.1	ksql-datagen
127.0.0.1	ksqldb-cli
127.0.0.1	ksqldb-server
127.0.0.1	rest-proxy
127.0.0.1	schema-registry
127.0.0.1	zookeeper
```

NOTE: to register schema and receive the ID. 

``` bash
$ curl -X POST -H "Content-Type: application/vnd.schemaregistry.v1+json" --data-binary @AAA.json http://schema-registry:8081/subjects/AAA-value/versions

=> {"ID":"53"}
```

NOTE: test producer and consumer with schema

```bash
docker-compose exec schema-registry kafka-protobuf-console-producer --bootstrap-server broker:29092 --property value.schema.id="53" --property schema.registry.url="http://schema-registry:8081" --topic AAA

<= {"message":"test"}
```

```bash
docker-compose exec schema-registry kafka-protobuf-console-consumer --bootstrap-server broker:29092 --from-beginning --property value.schema.id="53" --property schema.registry.url="http://schema-registry:8081" --skip-message-on-error --topic AAA

=> {"message":"test"}
```

Everything should be fine.

## Problem
When i using the protobuf in nodejs, the serialization is off and the above consumer shows errors. I test with two library, with google protobuf and  protobufjs both give me the same buffer. I couldn't find anyway to inspect data inside the kafka.

NOTE: to generate AAA_pb.js, if you like you can skip.

```bash
$ brew install protobuf
$ protoc --proto_path=. --js_out=import_style=commonjs_strict:. AAA.proto
```

```bash
$ brew install node@12 yarn
$ yarn install
```

```bash
# google protobuf sample
$ node AAA
# protobufjs sample
$ node BBB
```
