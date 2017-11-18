/**
 * Created by rkdgusrnrlrl on 17. 11. 18.
 */
var websocket = require('websocket-stream')
var WebSocketServer = require('ws').Server
var Connection = require('mqtt-connection')
var server = http.createServer()

var wss = new WebSocketServer({server: server})

if (handler) {
    server.on('client', handler)
}

wss.on('connection', function (ws) {
    var stream = websocket(ws)

    // 타임 아웃 설절 5분
    stream.setTimeout(1000 * 60 * 5)

    var connection = new Connection(stream)

    handle(connection);

    stream.on('timeout', function () {
        connection.destroy()
    })
})

function handle (client) {

    // client connected
    client.on('connect', function (packet) {
        // acknowledge the connect packet
        client.connack({ returnCode: 0 })
    })

    // client published
    client.on('publish', function (packet) {
        // send a puback with messageId (for QoS > 0)
        client.puback({ messageId: packet.messageId })
    })

    // client pinged
    client.on('pingreq', function () {
        // send a pingresp
        client.pingresp()
    });

    // client subscribed
    client.on('subscribe', function (packet) {
        // send a suback with messageId and granted QoS level
        client.suback({ granted: [packet.qos], messageId: packet.messageId })
    })

    // timeout idle streams after 5 minutes
    stream.setTimeout(1000 * 60 * 5)

    // connection error handling
    client.on('close', function () { client.destroy() })
    client.on('error', function () { client.destroy() })
    client.on('disconnect', function () { client.destroy() })

}