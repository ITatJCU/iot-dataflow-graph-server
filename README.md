IoT Dataflow Graph Server
=========================

**This project was originally developed for marketing [James Cook University](http://www.jcu.edu.au)'s Internet of Things (IoT) curriculum to high school students.**

The server provides a way to control dataflow between a series of networked, single-purpose embedded devices. Each device acts as either a source or a sink, providing sensor data or a feedback mechanism, respectively. Dataflow between devices is dictated by a dataflow graph, created visually using the web frontend.

The server requires [IO.js](https://iojs.org/) to run, and the web-based client requires a modern, standards-compliant web browser.

To install the server's dependencies, navigate to the `server` directory and execute:

```
npm install .
```

To run the server, navigate to the `server` directory and execute:

```
iojs server.js
```

The web client will then automatically launch in the user's default web browser.


Setup the server to use your own devices
----------------------------------------

The source and sink node types are defined in the following files:
- `server/nodes/sources.json`
- `server/nodes/sinks.json`

Each node type consists of an identifier and a human-readable label. The identifier for each node must match the one used by the corresponding device.

For an example of the network-related logic that source and sink devices need to conform to, check out the example source and sink scripts in the `dummy-devices` directory.


License
-------

The server and all related code is licensed under the MIT License. See [`LICENSE`](./LICENSE) for details.

The web client also includes the following libraries in the `server/client/js/thirdparty` directory:

- [jQuery](https://jquery.com/) (MIT License)

- [jsPlumb Community Edition](https://github.com/sporritt/jsplumb/) (Dual MIT/GPL2 license)
