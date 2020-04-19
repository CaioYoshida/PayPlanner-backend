const connection = require('./database/connection');
const brcypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { expiresIn, secret } = require('./config/authConfig');

module.exports={
  Query: {
    /**
     * user queries
     */

    users: async (root, args, context, info) => {
      if (!context.token) {
        return [];
      }

      const users = await connection('users').select('*');

      const usersWithBills = await users.map(user => ({
        ...user,
        bills: connection('bills').where('user_id', user.id).select('*')
      }));

      console.log(`Token: ${context.user_id}`);

      return usersWithBills;
    },

    user: async (_, { id }) => {
      const user = await connection('users').where('id', id ).first();
      
      if(user) {
        const bills = await connection('bills')
          .where('user_id', user.id)
          .select('*');
        
        user.bills = bills;

        return user;
      } else {
        return new Error('User not found');
      }
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

      if (bill) {
        bill.user = await connection('users').where('id', bill.user_id).first()

        return bill;  
      } else {
        return new Error('Bill not found!');
      }
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

      if (new_password && !passwordMatches) {
        return new Error("Password doesn't match!");

      }else if (new_password && passwordMatches) {
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
      };
    },
    deleteUser: async (_, { id }) => {
      await connection('users').where('id', id).delete();
    },

    /**
     * Login mutations
     */

    login: async (_, { email, password }, { request }) => {
      const user = await connection('users').where('email', email).first();

      if (!user) {
        return new Error('User not found!');
      }

      const passwordMatches = await brcypt.compareSync(password, user.password);

      if (!passwordMatches) {
        return new Error("Password doesn't macth");
      }

      const token = jwt.sign({claims: { id: user.id }}, secret, {expiresIn: expiresIn});

      return token;
    },

    /**
     * bill mutations
     */

    createBill: async (_, { user_id, title, date, value }) => {
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