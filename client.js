
var mows = require('mows')
const mqttUrl = 'ws://localhost:8000/mqtt';
const topic = "hello"

let client = mows.createClient(mqttUrl)

client.subscribe("hello")

client.on('message', (topic, msg) => {
    console.log(msg)
})