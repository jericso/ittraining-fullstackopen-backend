require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const Person = require('./models/person');
const app = express();
const port = process.env.PORT;

morgan.token('req[body]', (request, response) => JSON.stringify(request.body));

app.use(express.json());
app.use(
  morgan(function (tokens, request, response) {
    const formatTokens = [
      tokens.method(request, response),
      tokens.url(request, response),
      tokens.status(request, response),
      tokens.res(request, response, 'content-length'),
      '-',
      tokens['response-time'](request, response),
      'ms',
    ];

    return request.method === 'POST'
      ? formatTokens.concat(tokens['req[body]'](request, response)).join(' ')
      : formatTokens.join(' ');
  })
);
app.use(express.static('dist'));

let persons = [
  {
    id: '1',
    name: 'Arto Hellas',
    number: '040-123456',
  },
  {
    id: '2',
    name: 'Ada Lovelace',
    number: '39-44-5323523',
  },
  {
    id: '3',
    name: 'Dan Abramov',
    number: '12-43-234345',
  },
  {
    id: '4',
    name: 'Mary Poppendieck',
    number: '39-23-6423122',
  },
];

app.get('/', (request, response) => {
  response.send('<h1>Phonebook backend</h1>');
});

app.get('/info', (request, response) => {
  Person.find({}).then((persons) => {
    let numberOfPersons = persons.length;
    let personsText = numberOfPersons === 1 ? 'person' : 'people';

    response.send(
      `<div>Phonebook has info for ${numberOfPersons} ${personsText}<br /><br />${new Date().toString()}</div>`
    );
  });
});

app.get('/api/persons', (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id;

  Person.findById(id).then((person) => {
    if (person) {
      response.json(person);
    } else {
      response.statusMessage = `'${id}' is not a valid person id`;
      response.status(404).end();
    }
  });
});

app.post('/api/persons', (request, response) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'name or number are missing',
    });
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person.save().then((savedPerson) => {
    response.json(savedPerson);
  });
});

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id;
  persons = persons.filter((person) => person.id !== id);

  response.status(204).end();
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
