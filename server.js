const express = require("express");
const path = require("path");
const fs = require("fs");
const uniqid = require('uniqid');

// Set up Express app to listen on port 5052
let app = express();
let PORT = process.env.PORT || 5052;

// Set up Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
let notes = require("./db/db.json");

// Routes
app.get("/notes", function (req, res) {
  res.sendFile(path.join(__dirname, "public/notes.html"));
});

// Display notes
app.get("/api/notes", function (req, res) {
  fs.readFile("db/db.json", "utf8", function (err, data) {
    if (err) {
      console.log(err);
      return;
    }
    res.json(notes);
  });
});

// Starts server to begin listening
app.listen(PORT, function () {
  console.log(`App listening at http://localHost:${PORT}`);
});

// Create new note
app.post("/api/notes", function (req, res) {
  let newNote = {
    id: uniqid(),
    title: req.body.title,
    text: req.body.text,
  };
  notes.push(newNote);
  const stringifyNote = JSON.stringify(notes);
  res.json(notes);
  fs.writeFile("db/db.json", stringifyNote, (err) => {
    if (err) console.log(err);
    else {
      console.log(`Saved ==> Note id:${newNote.id}, Title:${newNote.title}, Text:${newNote.text}`);
    }
  });
});

// Delete note
app.delete("/api/notes/:id", function (req, res) {
  let noteID = req.params.id;
  fs.readFile("db/db.json", "utf8", function (err, data) {
    let updatedNotes = JSON.parse(data).filter((note) => {
      return note.id !== noteID;
    });
    notes = updatedNotes;
    const stringifyNote = JSON.stringify(updatedNotes);
    fs.writeFile("db/db.json", stringifyNote, (err) => {
      if (err) console.log(err);
      else {
        console.log(`Deleted ==> Note id:${req.params.id}, Title:${req.params.title}, Text:${req.params.text}`);
      }
    });
    res.json(stringifyNote);
  });
});

// Catch all error route
app.get("*", function (req, res) {
  res.sendFile(path.join(__dirname, "public/index.html"));
});