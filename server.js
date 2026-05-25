const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

require("dotenv").config();

console.log(process.env.MONGO_URL);

const app = express();

app.use(cors());
app.use(express.json());

const NoteSchema = new mongoose.Schema({
  text: String,
});

const Note = mongoose.model("Note", NoteSchema);

app.get("/notes", async (req, res) => {
  const notes = await Note.find();
  res.json(notes);
});

app.post("/notes", async (req, res) => {
  const newNote = new Note({
    text: req.body.text,
  });

  await newNote.save();
  res.json(newNote);
});

app.delete("/notes/:id", async (req, res) => {
  await Note.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

mongoose.connect(process.env.MONGO_URL)
.then(() => {
  console.log("MongoDB Connected");

  app.listen(5000, () => {
    console.log("Server running on port 5000");
  });
})
.catch((err) => console.log(err));