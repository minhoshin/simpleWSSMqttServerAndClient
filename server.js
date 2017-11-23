/**
 * Created by rkdgusrnrlrl on 17. 11. 18.
 */
var websocket = require("websocket-stream")
var WebSocketServer = require("ws").Server
var Connection = require("mqtt-connection")
var http = require("http");
var server = http.createServer(function (request, response) {

    let jsonData = "";
    request.on("data", (data) => jsonData+= data)
    request.on("end", () => {
        if (request.url === "/hello") {
            const reqJson = JSON.parse(jsonData)
            sentHello(reqJson.msg)
        }
        jsonData = "";
        response.end()
    })

})

var wss = new WebSocketServer({server: server})

var topicMap = {};
setInterval(function () {
    for (let topic in topicMap) {
        const clientList = topicMap[topic];
        console.log(`현재 ${topic} 접속 클라이어트 갯수 : ${clientList.length}`)
    }
}, 500)

wss.on("connection", function (ws) {
    var stream = websocket(ws)
    var connection = new Connection(stream)

    handle(connection)
})

function handle (client) {

    // client connectedCreate a client instance
    client.on("connect", function (packet) {
        // acknowledge the connect packet

        client.id = packet.clientId

        client.connack({ returnCode: 0 })
        let topicPool = topicMap["hello"]
        if(topicPool) {
            topicPool.push(client)
        } else {
            topicMap["hello"] = [client];
        }

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

function sentHello(msg) {
    let topicPool = topicMap["hello"];
    if (!topicPool) return;
    topicPool.forEach((clt) => {
        clt.publish({topic :"hello", payload : msg});
    });
}


server.listen(8000, function () {
    console.log("Listening on %d", server.address().port);
})