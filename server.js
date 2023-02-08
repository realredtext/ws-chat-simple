var {Server} = require("ws");
var {readFileSync, writeFileSync} = require("fs");
var {createServer} = require("http");
var {randomBytes} = require("crypto");

var server = createServer((req, res) => {
	res.end(readFileSync("page.html", "utf8"));
});
server.listen(8080);

var wss = new Server({
	server
});

wss.broadcast = function(data) {
	wss.clients.forEach((client) => {
		client.send(JSON.stringify(data));
	});
};

wss.on("connection", (ws) => {
	ws.sdata = {};
	
	ws.on("message", (msg) => {
		let data = JSON.parse(msg);
		var kind = data.kind;
		var message = data.message.slice(0, 400);
		var name = data.name.slice(0, 40);
		var color = data.color;
		if(kind !== "chat") return;
		if(Date.now() - ws.sdata.lastChat < 1000) {
			ws.send(JSON.stringify({
				kind: "server",
				message: "You are chatting too fast"
			}));
			return;
		};
		ws.sdata.lastChat = Date.now();
		
		wss.broadcast({
			name,
			message,
			color,
			kind: "chat"
		});
	});
});
