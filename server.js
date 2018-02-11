/**
 * Created by rkdgusrnrlrl on 17. 11. 18.
 */
const uuid = require("uuid")
const websocket = require("websocket-stream")
const WebSocketServer = require("ws").Server
const Connection = require("mqtt-connection")
const bodyParser = require('body-parser')

//ram db
let clientInfos = [];


//relay
const express = require('express')
const app = express()
app.use(bodyParser.json())

app.post('/hello', function(req, res){

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST");

    const reqJson = req.body

    const clientInfo = clientInfos.find((info) => info.sid === reqJson.sid);
    if (!clientInfo) return res.status(500).send('not reconize sid');

    sentMessage(reqJson.sid, clientInfo.name, reqJson.msg)
    res.end()
})

const http = require('http');
const server = http.createServer(app);

server.listen(8000, function () {
    console.log("Listening on %d", 8000)
})




//broker
// 현재 접속된 사용자 로그를 5초 간격으로 찍어줌
setInterval(function () {
    for (let topic in topicMap) {
        const clientList = topicMap[topic];
        console.log(`현재 ${topic} 접속 클라이어트 갯수 : ${clientList.length}`)
    }
}, 500)


// MQTT 브로커를 웹소켓 으로 랩핑
const wss = new WebSocketServer({server: server})

wss.on("connection", function (ws) {
    const stream = websocket(ws)
    const connection = new Connection(stream)

    handle(connection)
})

// 토픽 별로 클라이언트를 수집
let topicMap = {};

// hello 토픽에 등록 된 사용자들에게 메시지 전송
function sentMessage(sid, name, msg) {
    let topicPool = topicMap["hello"];
    if (!topicPool) return;
    topicPool.forEach((clt) => {
        if (clt.id !== sid) {
            clt.publish({topic :"hello", payload : JSON.stringify({msg: msg, name : name, sid : sid})});
        }
    });
}

// MQTT 이벤트 핸들러
function handle (client) {

    // client connectedCreate a client instance
    client.on("connect", function (packet) {
        // acknowledge the connect packet

        client.id = uuid.v1();
        client.name = "anonymous"+new Date().getTime();

        client.connack({ returnCode: 0 })
        let topicPool = topicMap["hello"]
        if(topicPool) {
            topicPool.push(client)
        } else {
            topicMap["hello"] = [client];
        }
        console.log(client.id)

        clientInfos.push({sid : client.id, name : client.name})
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
        topicMap["hello"] = topicMap["hello"].filter((cli) => cli.id !== client.id )
        client.destroy()
    })

    client.on("error", function () { client.destroy() })
    client.on("disconnect", function () {
        client.destroy()
    })

}



