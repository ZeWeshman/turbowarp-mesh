# TurboWarp ↔ Scratch 1.4 Mesh Bridge

This repository enables communication between **TurboWarp** and **Scratch 1.4** using the Mesh feature. It includes:

- **A server (bridgeServer):** Required for facilitating communication between Scratch 1.4 and TurboWarp clients.
- **Example chat projects:**
  - A local chat project for TurboWarp.
  - A local chat project for Scratch 1.4.

This project allows both Scratch 1.4 and TurboWarp clients to share broadcasts and variables in a seamless, albeit sometimes glitchy, manner.

---

## Features

- **Mesh support for TurboWarp and Scratch 1.4.**  
  TurboWarp and Scratch 1.4 clients can communicate in real-time via broadcasts and shared variables.

- **Multiple client compatibility.**  
  Both TurboWarp and Scratch 1.4 clients can connect simultaneously.

- **Custom TurboWarp extension.**  
  Designed to interact with the Mesh protocol, providing new blocks for broadcasting and variable syncing.

---

## Prerequisites

1. **Scratch 1.4**  
   - Download Scratch 1.4 from the official Scratch website.  
   - Enable Mesh networking (guides are available online).  

2. **TurboWarp**  
   - Download TurboWarp.  
   - Import the custom extension provided in this repository.  
   - Run TurboWarp in **unsandboxed mode**.

3. **Node.js**  
   - Required to host the bridge server.

4. **Network Setup**  
   - If running on the same PC, use `localhost` as the IP address.  
   - For other devices, use the IP displayed in the server terminal.

---

## Installation

1. Clone this repository:  
   ```bash
   git clone https://github.com/ZeWeshman/turbowarp-mesh.git
   cd turbowarp-mesh
   ```

2. Install the required dependencies for the server:  
   ```bash
   npm install
   ```

3. Start the server:  
   ```bash
   node bridgeServer.js
   ```

4. Open the example projects:  
   - Import the **TurboWarp chat project** into TurboWarp.  
   - Open the **Scratch 1.4 chat project** in Scratch 1.4.  

5. Connect the clients:  
   - For Scratch 1.4, enter the server IP in the Mesh connection settings.  
   - For TurboWarp, the connection is handled by the custom extension.

---

## How Mesh Works

### In Scratch 1.4:
- **Broadcasts:** Shared between all connected clients. If a broadcast doesn't appear, send it from another client.  
- **Variables:** Access other clients' variables using the `(sensor value [ v])` block. Only the latest value from all clients is visible.

### In TurboWarp:
- The same functionality is implemented using custom blocks (as the default blocks cannot be overridden).

---

## Known Issues

- Occasional glitches with variable syncing between multiple clients.  
- Requires TurboWarp to run unsandboxed.  

---

## Contributing

If you have ideas or improvements for the server or extension code, feel free to open a pull request or submit an issue. Community contributions are welcome!

---

## License

This project is licensed under the [MIT License](LICENSE).

---

## Related

- [Scratch 1.4 Official Website](https://scratch.mit.edu/download/scratch1_4/)  
- [TurboWarp](https://turbowarp.org/)  
