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

app.get('/', (request, response) => {
  response.send('<h1>Phonebook backend</h1>');
});

app.get('/info', (request, response, next) => {
  Person.find({})
    .then((persons) => {
      let numberOfPersons = persons.length;
      let personsText = numberOfPersons === 1 ? 'person' : 'people';

      response.send(
        `<div>Phonebook has info for ${numberOfPersons} ${personsText}<br /><br />${new Date().toString()}</div>`
      );
    })
    .catch((error) => next(error));
});

app.get('/api/persons', (request, response, next) => {
  Person.find({})
    .then((persons) => {
      response.json(persons);
    })
    .catch((error) => next(error));
});

app.get('/api/persons/:id', (request, response, next) => {
  const id = request.params.id;

  Person.findById(id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.statusMessage = `'${id}' is not a valid person id`;
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.post('/api/persons', (request, response, next) => {
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

  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson);
    })
    .catch((error) => next(error));
});

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body;

  Person.findById(request.params.id)
    .then((person) => {
      if (!person) {
        return response.status(404).end();
      }

      person.name = name;
      person.number = number;

      return person
        .save()
        .then((updatedPerson) => {
          response.json(updatedPerson);
        })
        .catch((error) => next(error));
    })
    .catch((error) => next(error));
});

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  }

  next(error);
};

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
