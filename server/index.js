const express = require("express");
const path = require("path");

const app = require("express")();
const http = require("http").Server(app);

// const projectId = "esnet-dataviewer";
// const keyFilename = "./server/keyfile.json";

// Serve static assets
app.use(express.static(path.resolve(__dirname, "..", "build")));

// Always return the main index.html, so react-router render the route in the client
app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "..", "build", "index.html"));
});

http.listen(8080, () => console.log("listening on *:8080"));
