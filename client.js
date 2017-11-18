/**
 * Created by rkdgusrnrlrl on 17. 11. 18.
 */
const mqtt = require('mqtt')

const sid = 1;

var client = mqtt.connect('localhost:', {query : { clientId : sid }});

client.on('connect', function () {
    console.log("client connect");
})

client.on('message', function (topic, message) {
    // message is Buffer
    console.log(topic)
    console.log(message)
})
