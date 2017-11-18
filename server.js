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
    var connection = new Connection(stream)

    handle(connection)
})

function handle (conn) {
    // handle the MQTT connection like
    // the net example
}