// Import WebSocket and net libraries
const WebSocket = require('ws');
const net = require('net');

// Helper function to get a timestamp
function getTimestamp() {
    return new Date().toISOString();
}

// WebSocket server for TurboWarp clients
const wss = new WebSocket.Server({ port: 8080 });

// TCP server for Scratch 1.4 Mesh clients
const tcpServer = net.createServer();

// Store connected WebSocket and TCP clients
let wsClients = [];
let tcpClients = [];

// Object to store sensor variables with default values
const sensorValues = {};

// Handle WebSocket connections from TurboWarp clients
wss.on('connection', (ws) => {
    console.log(`[${getTimestamp()}] TurboWarp client connected`);

    wsClients.push(ws);

    // Function to handle messages from TurboWarp clients
    ws.on('message', (data) => {
        console.log(`[${getTimestamp()}] Received message from TurboWarp client:`, data.toString());

        // Prepare message with 4-byte size field for Scratch 1.4 clients
        const messageLength = Buffer.byteLength(data);
        const sizeBuffer = Buffer.alloc(4);
        sizeBuffer.writeUInt32BE(messageLength, 0);
        const messageWithSizeField = Buffer.concat([sizeBuffer, Buffer.from(data)]);

        // Forward the modified message to all Scratch 1.4 clients
        tcpClients.forEach((tcp) => {
            tcp.write(messageWithSizeField);
        });

        // Forward the unmodified message to other TurboWarp clients
        wsClients.forEach((client) => {
            if (client !== ws) {
                client.send(data);
            }
        });
    });

    ws.on('close', () => {
        console.log(`[${getTimestamp()}] TurboWarp client disconnected`);
        wsClients = wsClients.filter(client => client !== ws);
    });

    // Handle WebSocket errors gracefully
    ws.on('error', (error) => {
        console.log(`[${getTimestamp()}] WebSocket error:`, error);
    });
});

// Handle TCP connections from Scratch 1.4 clients
tcpServer.on('connection', (tcp) => {
    console.log(`[${getTimestamp()}] Scratch 1.4 client connected`);

    tcpClients.push(tcp);

    tcp.on('data', (data) => {
        console.log(`[${getTimestamp()}] Received data from Scratch 1.4:`, data.toString());

        // Process incoming data after removing the size field
        const message = data.slice(4).toString(); // Remove the 4-byte size field

        // Forward message to other Scratch 1.4 clients
        tcpClients.forEach((tcpClient) => {
            if (tcpClient !== tcp) { // Avoid sending to the same client
                tcpClient.write(data);
            }
        });

        // Process message content
        if (message.includes('sensor-update')) {
            console.log(`[${getTimestamp()}] Processing sensor-update message`);
            if (message.includes('broadcast')) {
                const sensorData = message.split('sensor-update')[1].split('broadcast')[0];
                const broadcastData = message.split('broadcast')[1];

                // Process the sensor-update part
                processSensorUpdate(sensorData);
                // Process the broadcast part
                processBroadcast(broadcastData);
            } else {
                const sensorData = message.split('sensor-update')[1];
                processSensorUpdate(sensorData);
            }
        } else if (message.includes('broadcast')) {
            const broadcastData = message.split('broadcast')[1];
            processBroadcast(broadcastData);
        } else if (message.includes('send-vars') || message.includes('peer-name anonymous')) {
            // Send all sensor variables to the requesting Scratch client
            sendAllSensorUpdates(tcp);
        } else {
            console.log(`[${getTimestamp()}] Message ignored:`, message);
        }
    });

    tcp.on('close', () => {
        console.log(`[${getTimestamp()}] Scratch 1.4 client disconnected`);
        tcpClients = tcpClients.filter(client => client !== tcp);
    });

    // Handle TCP errors gracefully
    tcp.on('error', (error) => {
        console.log(`[${getTimestamp()}] TCP connection error:`, error);
    });
});

// Start the TCP server
tcpServer.listen(42001, () => {
    console.log(`[${getTimestamp()}] TCP server listening on port 42001`);
});

// Global error handling for uncaught errors
process.on('uncaughtException', (error) => {
    console.error(`[${getTimestamp()}] Uncaught exception:`, error);
    process.exit(1);  // Exit process after logging the error
});

// Handle WebSocket server errors gracefully
wss.on('error', (error) => {
    console.log(`[${getTimestamp()}] WebSocket server error:`, error);
});

// Function to process sensor-update messages
function processSensorUpdate(data) {
    console.log(`[${getTimestamp()}] Processing sensor-update data:`, data);

    // Regex to match variable names and values
    const regex = /"([^"]+)"\s+("([^"]*)"|\d+)/g;
    const matches = [...data.matchAll(regex)];

    if (matches.length === 0) {
        console.log(`[${getTimestamp()}] No matches found. Check the data format.`);
    } else {
        matches.forEach((match) => {
            const variable = match[1];
            const value = match[2];

            // Update or add variable to sensorValues with the received value
            sensorValues[variable] = value;

            // Send sensor-update to TurboWarp clients
            wsClients.forEach((ws) => {
                console.log(`[${getTimestamp()}] Sending sensor-update to TurboWarp client: "${variable}" ${value}`);
                ws.send(`sensor-update "${variable}" ${value}`);
            });
        });
    }
}

// Function to send all stored sensor variables to a Scratch client
function sendAllSensorUpdates(tcpClient) {
    // Prepare the message string with all stored sensor variables and values
    let message = 'sensor-update ';
    for (const [variable, value] of Object.entries(sensorValues)) {
        message += `"${variable}" ${value} `;
    }
    console.log(`[${getTimestamp()}] Sending all stored sensor values to Scratch client:`, message.trim());

    // Add 4-byte size field and send to the requesting Scratch client
    const messageBuffer = Buffer.from(message.trim());
    const sizeBuffer = Buffer.alloc(4);
    sizeBuffer.writeUInt32BE(messageBuffer.length, 0);
    tcpClient.write(Buffer.concat([sizeBuffer, messageBuffer]));
}

// Function to handle broadcast messages
function processBroadcast(data) {
    console.log(`[${getTimestamp()}] Processing broadcast data:`, data);

    // Split the broadcast data into parts based on "broadcast" keyword
    let dataList = data.split('broadcast').filter((item) => item.trim() !== '');

    // Process each broadcast message
    dataList.forEach((broadcastMessage) => {
        console.log(`[${getTimestamp()}] Sending broadcast to TurboWarp clients: ${broadcastMessage.trim()}`);
        wsClients.forEach((ws) => {
            ws.send(`broadcast ${broadcastMessage.trim()}`);
        });
    });
}
