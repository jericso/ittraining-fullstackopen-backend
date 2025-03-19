const mongoose = require('mongoose');

mongoose.set('strictQuery', false);

const url = process.env.PHONEBOOK_MONGODB_URI;

console.log('connecting to', url);
mongoose
  .connect(url)

  .then((result) => {
    console.log('connected to MongoDB');
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message);
  });

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: [true, 'Name required'],
  },
  number: {
    type: String,
    minLength: 8,
    required: [true, 'Number required'],
    validate: {
      validator: function (v) {
        return /^\d{2,3}-{1}\d+$/.test(v);
      },
      message: (props) => `${props.value} is not a valid number`,
    },
  },
});

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model('Person', personSchema);
