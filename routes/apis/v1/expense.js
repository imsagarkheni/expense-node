let express = require("express");
let router = express.Router();
const mongoConnection = require('../../../utils/connections');
const responseManager = require('../../../utils/response.manager');
const usersModel = require('../../../models/users.model');
const expenses = require('../../../models/expenses.model');
const helper = require('../../../utils/helper');
const constants = require('../../../utils/constants');
const { default: mongoose } = require("mongoose");


router.post('/addexpense', helper.authenticateToken, async (req, res) => {
    try {
      const { date, description, amount, to } = req.body;
      const primary = mongoConnection.useDb(constants.DEFAULT_DB);
  
      // Find user data
      const userData = await primary.model(constants.MODELS.users, usersModel)
        .findOne({ _id: mongoose.Types.ObjectId(req.token.userid) });
      if (!userData) {
        return responseManager.onError('User not found!', res);
      }
      const parsedAmount = parseInt(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            return responseManager.badRequest('Invalid amount!', res);
        }
  
      const expenseObj = {
        user_id: req.token.userid,
        to: to ? to : "",
        date: date,
        description: description,
        amount: parsedAmount
      };
  
      await primary.model(constants.MODELS.expenses, expenses).create(expenseObj);
  
      const newAmount = userData.wallet - parsedAmount;
      console.log("newAmount",newAmount);
        const updateUserResult = await primary.model(constants.MODELS.users, usersModel).updateOne(
            { _id: mongoose.Types.ObjectId(req.token.userid) },
            { $set: { wallet: newAmount } }
        );
        return responseManager.onSuccess('Expense added successfully!', { newAmount }, res);

    } catch (error) {
      return responseManager.onError(error, res);
    }
  });

  router.get('/expenselist', helper.authenticateToken, async (req, res) => {
    console.log("req.query",req.query);
    try {
        
        const { id } = req.query; // Access user ID from query parameters
        const primary = mongoConnection.useDb(constants.DEFAULT_DB);
        let expenseData = await primary.model(constants.MODELS.expenses, expenses).find({ user_id: id }); // Use the correct user ID
        if (expenseData) {
            return responseManager.onSuccess('Expense list!', expenseData, res);
        } else {
            return responseManager.onError('No expenses found!', res);
        }
    } catch (error) {
        console.log("error", error);
        return responseManager.onError(error, res); // Handle any errors
    }
});

  
 module.exports = router;
