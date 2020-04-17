const connection = require('./database/connection');
const brcypt = require('bcryptjs');

module.exports={
  Query: {
    /**
     * user queries
     */

    users: async () => {
      const users = await connection('users').select('*');

      const usersWithBills = await users.map(user => ({
        ...user,
        bills: connection('bills').where('user_id', user.id).select('*')
      }));

      return usersWithBills;
      },

    user: async (_, { id }) => {
      const user = await connection('users').where('id', id ).first();

      user.bills = await connection('bills').where('user_id', 1).select('*')
    
      return user;
    },

    /**
     * bill queries
     */

    bills: async () => {
      const bills = await connection('bills').select('*');

      const billsWithUser = await bills.map(bill => ({
        ...bill,
        user: connection('users').where('id', bill.user_id).first()
      }));

      return billsWithUser;
    },

    bill: async (_, { id }) => {
      const bill = await connection('bills')
        .where('id', id )
        .first();

      bill.user = await connection('users').where('id', bill.user_id).first()

      return bill;
    },
  },

  Mutation: {
    /**
     * user mutations
     */

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

    /**
     * bill mutations
     */

    createBill: async (_, { user_id, title, date, value}) => {
      const [newBill] = await connection('bills')
        .returning('*')
        .insert({
          user_id,
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