module.exports = nohm.model('Address', {
  properties: {
    email: {
      type: 'string',
      unique: true,
      validations: [
        'email'
      ]
    },
    validated: {
      type: "boolean",
      defaultValue: false,
    }
  },
});
