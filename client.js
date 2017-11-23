
var mows = require('mows')
const mqttUrl = 'ws://localhost:8000/mqtt';
const topic = "hello"

let client = mows.createClient(mqttUrl)

let sid = ""

client.on('message', (topic, msg) => {
    console.log(msg)
    if (topic === "sid") {
        sid = JSON.parse(msg).sid
    }
    console.log(`sid : ${sid}`)
})