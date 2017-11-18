/**
 * Created by rkdgusrnrlrl on 17. 11. 18.
 */
var websocket = require('websocket-stream')
var WebSocketServer = require('ws').Server
var Connection = require('mqtt-connection')
var http = require('http');
var server = http.createServer()

var wss = new WebSocketServer({server: server})


wss.on('connection', function (ws) {
    var stream = websocket(ws)
    var connection = new Connection(stream)

    handle(connection)
})

function handle (client) {

    // client connectedCreate a client instance
    client.on('connect', function (packet) {
        // acknowledge the connect packet

        client.connack({ returnCode: 0 })

        client.publish({topic :"hello", payload : "connect"})
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

    // connection error handling
    client.on('close', function () { client.destroy() })
    client.on('error', function () { client.destroy() })
    client.on('disconnect', function () { client.destroy() })

}


function testSendMessage(client) {
    client.publish({payload : "hello"});
}

server.listen(8000, function () {
    console.log('Listening on %d', server.address().port);
})