const config = require('./config');
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = config.web.port;

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method);
  console.log('Path:  ', request.path);
  console.log('Body:  ', request.body);
  console.log('---');
  next();
};

app.use(express.json());
app.use(requestLogger);

let notes = [
  {
    id: '1',
    content: 'HTML is easy',
    important: true,
  },
  {
    id: '2',
    content: 'Browser can execute only JavaScript',
    important: false,
  },
  {
    id: '3',
    content: 'GET and POST are the most important methods of HTTP protocol',
    important: true,
  },
];

const generateId = () => {
  const maxId =
    notes.length > 0 ? Math.max(...notes.map((note) => Number(note.id))) : 0;
  return String(maxId + 1);
};

const password = process.argv[2];
const url = `mongodb+srv://jericso:${password}@cluster0.rr0l9.mongodb.net/noteApp?retryWrites=true&w=majority&appName=Cluster0`;

mongoose.set('strictQuery', false);
mongoose.connect(url);

const noteSchema = new mongoose.Schema({
  content: String,
  important: Boolean,
});

noteSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Note = mongoose.model('Note', noteSchema);

app.get('/', (request, response) => {
  response.send('<h1>Notes backend</h1>');
});

app.get('/api/notes', (request, response) => {
  Note.find({}).then((notes) => {
    response.json(notes);
  });
});

app.get('/api/notes/:id', (request, response) => {
  const id = request.params.id;
  const note = notes.find((note) => note.id === id);
  if (note) {
    response.json(note);
  } else {
    response.statusMessage = `'${request.params.id}' is not a valid note id`;
    response.status(404).end();
  }
});

app.post('/api/notes', (request, response) => {
  const body = request.body;

  if (!body.content) {
    return response.status(400).json({
      error: 'content missing',
    });
  }

  const note = {
    content: body.content,
    important: body.important || false,
    id: generateId(),
  };

  notes = notes.concat(note);

  response.json(note);
});

app.delete('/api/notes/:id', (request, response) => {
  const id = request.params.id;
  notes = notes.filter((note) => note.id !== id);

  response.status(204).end();
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};

app.use(unknownEndpoint);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
