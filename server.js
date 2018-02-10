/**
 * Created by rkdgusrnrlrl on 17. 11. 18.
 */
const uuid = require("uuid")
const websocket = require("websocket-stream")
const WebSocketServer = require("ws").Server
const Connection = require("mqtt-connection")
const bodyParser = require('body-parser')

//relay
const express = require('express')
const app = express()
app.use(bodyParser.json())

app.post('/hello', function(req, res){
    const reqJson = req.body
    console.log(reqJson)
    sentMessage(reqJson.sid, reqJson.msg)
    res.end()
})

const http = require('http');
const server = http.createServer(app);

server.listen(8000, function () {
    console.log("Listening on %d", 8000)
})

function sentMessage(sid, msg) {
    let topicPool = topicMap["hello"];
    if (!topicPool) return;
    topicPool.forEach((clt) => {
        if (clt.id !== sid) {
            clt.publish({topic :"hello", payload : JSON.stringify({msg: msg, sid : sid})});
        }
    });
}


//broker
const wss = new WebSocketServer({server: server})

let topicMap = {};
setInterval(function () {
    for (let topic in topicMap) {
        const clientList = topicMap[topic];
        console.log(`현재 ${topic} 접속 클라이어트 갯수 : ${clientList.length}`)
    }
}, 500)

wss.on("connection", function (ws) {
    const stream = websocket(ws)
    const connection = new Connection(stream)

    handle(connection)
})

function handle (client) {

    // client connectedCreate a client instance
    client.on("connect", function (packet) {
        // acknowledge the connect packet

        client.id = uuid.v1();

        client.connack({ returnCode: 0 })
        let topicPool = topicMap["hello"]
        if(topicPool) {
            topicPool.push(client)
        } else {
            topicMap["hello"] = [client];
        }
        console.log(client.id)
        client.publish({topic : "sid", payload : JSON.stringify({sid : client.id})})
    })

    // client published
    client.on("publish", function (packet) {
        // send a puback with messageId (for QoS > 0)
        client.puback({ messageId: packet.messageId })
    })

    // client pinged
    client.on("pingreq", function () {
        // send a pingresp
        client.pingresp()
    });

    // client subscribed
    client.on("subscribe", function (packet) {
        // send a suback with messageId and granted QoS level
        client.suback({ granted: [packet.qos], messageId: packet.messageId })
    })

    // connection error handling
    client.on("close", function () {
        console.log("close")
        topicMap["hello"] = topicMap["hello"].filter((cli) => cli.id !== client.id )
        client.destroy()
    })

    client.on("error", function () { client.destroy() })
    client.on("disconnect", function () {
        console.log("disconnect")
        client.destroy()
    })

}



