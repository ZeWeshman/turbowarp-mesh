class MeshExtension {
  constructor() {
    this.variables = {}; // Store variables received from Scratch 1.4 clients
    this.broadcasts = {}; // Store received broadcasts
    this.ws = null; // WebSocket instance for Mesh server connection
    console.log("MeshExtension initialized");
  }

  getInfo() {
    return {
      id: 'meshExtension',
      name: 'Mesh Communication',
      blocks: [
        {
          opcode: 'whenIReceiveMeshBroadcast',
          blockType: Scratch.BlockType.HAT,
          text: 'when I receive Mesh broadcast [broadcast]',
          arguments: {
            broadcast: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'defaultBroadcast'
            }
          }
        },
        {
          opcode: 'getMeshVariable',
          blockType: Scratch.BlockType.REPORTER,
          text: 'get Mesh variable [variable]',
          arguments: {
            variable: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'defaultVariable'
            }
          }
        },
        {
          opcode: 'connectToMeshServer',
          blockType: Scratch.BlockType.COMMAND,
          text: 'Connect to Mesh server [IP]',
          arguments: {
            IP: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'localhost'
            }
          }
        },
        {
          opcode: 'sendMeshBroadcast',
          blockType: Scratch.BlockType.COMMAND,
          text: 'Send Mesh broadcast [message]',
          arguments: {
            message: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'Hello, Mesh!'
            }
          }
        },
        {
          opcode: 'setMeshVariable',
          blockType: Scratch.BlockType.COMMAND,
          text: 'Set Mesh variable [variable] to [value]',
          arguments: {
            variable: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'defaultVariable'
            },
            value: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: '0'
            }
          }
        }
      ]
    };
  }

  onBroadcastReceived(data) {
    const message = data.toString();
    console.log("Received data from server:", message);

    if (message.startsWith('sensor-update')) {
        console.log("Processing sensor-update data");

        // Adjusted regex to match a variable in quotes followed by either a quoted string or an unquoted number
        const matches = message.match(/sensor-update\s+"([^"]+)"\s+("?[^"]*"?)/);
        
        if (matches) {
            const variableName = matches[1];
            let value = matches[2];

            // Remove any extraneous quotes around numeric values or empty strings
            value = value.replace(/^"|"$/g, '');

            console.log(`Received variable: ${variableName} with value: "${value}"`);

            if (variableName) {
                this.variables[variableName] = value; // Store the variable, preserving spaces within the value
                console.log(`Stored variable: ${variableName} = ${value}`);
            }
        } else {
            console.log("No match found in the sensor-update message. Check data format.");
        }
    }



    // Log broadcasts
    if (message.startsWith('broadcast')) {
      console.log("Processing broadcast data");

      const parts = message.split('broadcast ')[1];
      if (parts) {
        const broadcastMessage = parts.trim().replace(/"/g, '');
        console.log(`Received broadcast message: ${broadcastMessage}`);
        this.broadcasts[broadcastMessage] = true;
        console.log(`Stored broadcast message: ${broadcastMessage}`);
      }
      else {
        console.warn('warning: \'broadcast\' message format is unexpected:', message);
      }
    }
  }

  // Block: When I receive Mesh broadcast [broadcast]
  whenIReceiveMeshBroadcast(args) {
    const broadcastName = args.broadcast;
    // Check if the broadcast is triggered by an actual received broadcast
    if (this.broadcasts[broadcastName]) {
      console.log(`Broadcast triggered: ${broadcastName}`);
      this.broadcasts[broadcastName] = false; // Reset the broadcast to prevent re-triggering
      return true; // Return true when the broadcast is received
    }
    return false; // Return false if no matching broadcast is received
  }  

  // Block: Get Mesh variable [variable]
  getMeshVariable(args) {
    const variableName = args.variable;
    console.log(`Getting Mesh variable: ${variableName}`);
    if (this.variables[variableName]) {
      console.log(`Found variable: ${variableName} = ${this.variables[variableName]}`);
      return this.variables[variableName];
    }
    console.log(`Variable not found: ${variableName}`);
    return 0; // Return 0 if the variable doesn't exist
  }

  // Block: Connect to Mesh server [IP]
  connectToMeshServer(args) {
    const serverIP = args.IP;
    console.log(`Attempting to connect to Mesh server at: ${serverIP}`);

    // Ensure the WebSocket URL starts with 'ws://' and append ':8080'
    const url = serverIP.startsWith('ws://') ? `${serverIP}:8080` : `ws://${serverIP}:8080`;

    // Close the existing connection if it exists, ensuring data is cleared
    if (this.ws) {
      this.ws.close();
      this.clearSavedData(); // Clear saved data on manual disconnection
      console.log("Closed previous connection.");
    }

    // Check for WebSocket availability
    if (typeof WebSocket === 'undefined' && typeof window.WebSocket !== 'undefined') {
      this.ws = new window.WebSocket(url); // Use window.WebSocket for environments where WebSocket is not globally available
    } else {
      this.ws = new WebSocket(url); // Fallback for standard browsers
    }

    // Handle connection open event
    this.ws.onopen = () => {
      console.log("Connected to Mesh server");
    };

    this.ws.onmessage = (event) => {
      this.onBroadcastReceived(event.data); // Call onBroadcastReceived with the received data
    };

    // Handle WebSocket errors
    this.ws.onerror = (error) => {
      console.log("Error connecting to Mesh server:", error);
    };

    // Handle WebSocket close event for unexpected disconnections
    this.ws.onclose = () => {
      console.log("Disconnected from Mesh server");
      this.clearSavedData(); // Clear saved data on unexpected disconnection
    };
  }

  // Define reset functions for variables and broadcasts
  resetVariables() {
    // Clear all saved variables
    this.variables = {};  // Replace with actual variable clearing method as needed
    console.log("Variables reset.");
}

  resetBroadcasts() {
    // Clear all saved broadcasts
    this.broadcasts = {};  // Replace with actual broadcast clearing method as needed
    console.log("Broadcasts reset.");
}

  // Block: Send Mesh broadcast [message]
  sendMeshBroadcast(args) {
    const message = args.message;
    console.log(`Sending Mesh broadcast: ${message}`);
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(`broadcast "${message}"`);
      console.log("Broadcast sent");
    } else {
      console.log("Error: Not connected to Mesh server");
    }
  }

  // Block: Set Mesh variable [variable] to [value]
  setMeshVariable(args) {
    const variable = args.variable;
    const value = args.value;
    console.log(`Setting Mesh variable ${variable} to ${value}`);
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(`sensor-update "${variable}" "${value}"`);
      console.log(`Variable ${variable} set to ${value}`);
    } else {
      console.log("Error: Not connected to Mesh server");
    }
  }
  // Define a method to clear saved variables and broadcasts
  clearSavedData() {
    console.log("Clearing saved variables and broadcasts...");

    // Assuming variables and broadcasts are stored in these properties
    this.variables = {}; // Reset variables
    this.broadcasts = {}; // Reset broadcasts
  }
}

// Register the extension
Scratch.extensions.register(new MeshExtension());
