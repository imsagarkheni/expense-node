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
      const { date, text, amount, customer,type } = req.body;
      const primary = mongoConnection.useDb(constants.DEFAULT_DB);
  
      const expenseObj = {
        user_id: req.token.userid,
        customer: customer ? customer : "",
        date: date,
        description: text,
        amount: amount,
        type:type
      };
  
      await primary.model(constants.MODELS.expenses, expenses).create(expenseObj);
  
        return responseManager.onSuccess('Expense added successfully!', 1, res);

    } catch (error) {
      return responseManager.onError(error, res);
    }
  });

  router.get('/expenselist', helper.authenticateToken, async (req, res) => {
    try {
    
        const primary = mongoConnection.useDb(constants.DEFAULT_DB);
        let expenseData = await primary.model(constants.MODELS.expenses, expenses).find(); 
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

router.get('/getTotal', helper.authenticateToken, async (req, res) => {
  try {
  
      const primary = mongoConnection.useDb(constants.DEFAULT_DB);
      let expenseData = await primary.model(constants.MODELS.expenses, expenses).find(); 
      if (expenseData) {
        let totalIncome = 0;
        let totalExpense = 0;
        expenseData.map((ele)=>{
          if(ele.type === "income"){
            totalIncome += ele.amount
          }else{
            totalExpense += ele.amount
          }
        })
        let netBalance = totalIncome - totalExpense
        let total = {
          totalIncome:totalIncome,
          totalExpense:totalExpense,
          netBalance:netBalance
        }
          return responseManager.onSuccess('Expense data!', total, res);
      } else {
          return responseManager.onError('No expenses found!', res);
      }
  } catch (error) {
      console.log("error", error);
      return responseManager.onError(error, res); // Handle any errors
  }
});

router.post('/deleteExpense', helper.authenticateToken, async (req, res) => {
  try {
    const { id } = req.body;
    const primary = mongoConnection.useDb(constants.DEFAULT_DB);

    await primary.model(constants.MODELS.expenses, expenses).findByIdAndDelete(id);

      return responseManager.onSuccess('Expense deleted successfully!', 1, res);

  } catch (error) {
    return responseManager.onError(error, res);
  }
});
  
 module.exports = router;
