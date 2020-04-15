const connection = require('./database/connection');
const brcypt = require('bcryptjs');

module.exports={
  Query: {
    users: async () => await connection('users').select('*'),
    user: async (_, { id }) => await connection('users').where('id', id ),

    bills: async () => await connection('bills').select('*'),
    bill: async (_, { id }) => await connection('bills').where('id', id ),
  },

  Mutation: {
    createUser: async (_, { name, email, password }) => {
      const [newUser] = await connection('users')
        .returning('*')
        .insert({
          name,
          email,
          password: brcypt.hashSync(password, brcypt.genSaltSync(8))
        })

      return newUser;
    },

    updateUser: async (_, { id, name, email, new_password, old_password }) => {
      const { password } = await connection('users')
        .where('id', id)
        .select('password')
        .first();

      const passwordMatches = await brcypt.compareSync(old_password, password);
      
      if (new_password && passwordMatches) {
        const [user] = await connection('users')
          .where('id', id)
          .returning('*')
          .update({
            name,
            email,
            password: new_password
          });

        return user;
      } else {
        const [user] = await connection('users')
          .where('id', id)
          .returning('*')
          .update({
            name,
            email,
          });

        return user;
      }
    },
    deleteUser: async (_, { id }) => {
      await connection('users').where('id', id).delete();
    },


    createBill: async (_, { title, date, value}) => {
      const [newBill] = await connection('bills')
        .returning('*')
        .insert({
          title,
          date,
          value
        });

      return newBill;
    },

    updateBill: async (_, { id, title, date, value }) => {
      const [bill] = await connection('bills')
        .where('id', id)
        .returning('*')
        .update({
          title,
          date,
          value,
        });

      return bill;
    },
    deleteBill: async (_, { id }) => {
      await connection('bills').where('id', id).delete();
    },
  },
}