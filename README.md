# TurboWarp-Scratch Mesh Bridge

This repository contains tools and examples for enabling communication between Scratch 1.4's Mesh network and TurboWarp using a custom server (`bridgeServer.js`) and a TurboWarp extension (`turbowarpMesh.js`). The bridge allows Scratch 1.4 and TurboWarp clients to communicate seamlessly, including sharing broadcasts and variables.

## Features

- **Bridge Server**: Acts as the central communication hub for both Scratch 1.4 and TurboWarp clients.
- **TurboWarp Extension**: Provides custom blocks to handle Mesh communication.
- **Cross-Compatibility**: Scratch 1.4 and TurboWarp clients can share variables and broadcasts.
- **Examples**: Includes example projects for both Scratch 1.4 and TurboWarp demonstrating local chat functionality.

---

## Getting Started

### Prerequisites

1. **Scratch 1.4**
   - Download from the official Scratch website.
   - Enable Mesh networking. (Refer to online guides for assistance.)

2. **TurboWarp**
   - Install TurboWarp Desktop.
   - Import the provided extension (`turbowarpMesh.js`).
   - Run the TurboWarp extention in *unsandboxed* mode for full functionality.

3. **Node.js**
   - Install Node.js to host the `bridgeServer.js`.

---

### Setup

1. **Start the Server**:
   - Run the `bridgeServer.js` using Node.js:
     ```bash
     node bridgeServer.js
     ```
   - The server listens on:
     - Port `42001` for Scratch 1.4 clients.
     - Port `8080` for TurboWarp clients via WebSocket.

2. **Connect Clients**:
   - **Scratch 1.4**: Use the Mesh feature and connect to the server IP (e.g., `localhost`).
   - **TurboWarp**: Use the provided extension to connect via the block `Connect to Mesh server [IP]`.

3. **IP Address**:
   - For local setups, use `localhost`.
   - For networked setups, find the server's local IP address in the terminal output.

---

### How Mesh Works

- **Broadcasts**:
  - Scratch 1.4: Use broadcasts, which are shared across all clients.
  - TurboWarp: Custom blocks handle broadcasting (`Send Mesh broadcast [message]`) and receiving (`when I receive Mesh broadcast [broadcast]`).

- **Variables**:
  - Scratch 1.4: Access other clients' variables using the `(sensor value [variable])` block.
  - TurboWarp: Custom blocks allow getting and setting variables (`Set Mesh variable [variable] to [value]`).

---

## Example Projects

### Included Examples
1. **TurboWarp Chat**: A project showcasing how TurboWarp clients can chat using Mesh.
2. **Scratch 1.4 Chat**: A similar project for Scratch 1.4 clients.

The turbowarp project relies on the server to facilitate communication. Start the server before testing. If on the same server, both projects are compatible and can comunicate together.

---

## Contribution

If you encounter bugs or have ideas for improving the server or extension, feel free to open an issue or submit a pull request. Contributions to enhance compatibility, performance, or features are welcome.

---

## Troubleshooting

1. **Broadcasts Not Appearing**:
   - Ensure a broadcast is sent from one client to make it visible to others.

2. **Connection Issues**:
   - Verify that the server is running.
   - Check your firewall settings.

3. **Sandbox Errors in TurboWarp**:
   - Ensure you are running TurboWarp in unsandboxed mode.

---

## License

This project is open-source. Feel free to use and modify the code for your projects. Attribution is appreciated but not required.

---

## Links

- GitHub: [TurboWarp-Scratch Mesh Bridge](https://github.com/ZeWeshman/turbowarp-mesh)
- Scratch 1.4 Download: [Scratch Official Website](https://scratch.mit.edu/download/scratch1_4)
