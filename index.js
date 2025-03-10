const express = require('express');
const app = express();
const port = 3001;

app.use(express.json());

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
  let numberOfPersons = persons.length;
  let personsText = numberOfPersons === 1 ? 'person' : 'people';

  response.send(
    `<div>Phonebook has info for ${numberOfPersons} ${personsText}<br /><br />${new Date().toString()}</div>`
  );
});

app.get('/api/persons', (request, response) => {
  response.json(persons);
});

app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id;
  const person = persons.find((person) => person.id === id);
  if (person) {
    response.json(person);
  } else {
    response.statusMessage = `'${request.params.id}' is not a valid person id`;
    response.status(404).end();
  }
});

app.post('/api/persons', (request, response) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'name or number are missing',
    });
  }

  if (persons.find((person) => person.name === body.name)) {
    return response.status(400).json({
      error: `'${body.name}' already exists in the phonebook`,
    });
  }

  const person = {
    id: String(Math.floor(Math.random() * 10000)),
    name: body.name,
    number: body.number,
  };

  persons = persons.concat(person);

  response.json(person);
});

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id;
  persons = persons.filter((person) => person.id !== id);

  response.status(204).end();
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
