let express = require("express");
let router = express.Router();
let mongoose = require("mongoose");
const mongoConnection = require("../../../utils/connections");
const responseManager = require("../../../utils/response.manager");
const customers = require("../../../models/customers.model");
const helper = require("../../../utils/helper");
const constants = require("../../../utils/constants");
const expenses = require("../../../models/expenses.model");

router.post("/list", helper.authenticateToken, async (req, res) => {
  try {
    if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {

      const { page, limit, search } = req.body;
      const primary = mongoConnection.useDb(constants.DEFAULT_DB);

      let query = {};

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
        ];
      }

      let userList = await primary
        .model(constants.MODELS.customers, customers)
        .paginate(query, { page, limit });
      if (userList) {
        return responseManager.onSuccess("customers list...", userList, res);
      } else {
        return responseManager.onSuccess("No Result Found", 0, res);
      }
    } else {
      return responseManager.badRequest(
        { message: "Invalid token, please try again" },
        res
      );
    }
  } catch (error) {
    return responseManager.onError(error, res);
  }
});
router.post("/delete", helper.authenticateToken, async (req, res) => {
  try {
    if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
      const primary = mongoConnection.useDb(constants.DEFAULT_DB);
      const deletedUser = await primary
        .model(constants.MODELS.customers, customers)
        .findByIdAndDelete(req.body.id);
      if (deletedUser) {
        return responseManager.onSuccess(
          "customer deleted successfully.",
          1,
          res
        );
      } else {
        return responseManager.onError("customer not found.", res);
      }
    } else {
      return responseManager.badrequest(
        "Invalid token to delete customer, please try again.",
        res
      );
    }
  } catch (error) {
    return responseManager.onError(error, res);
  }
});

router.post("/createcustomer", helper.authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;
    const primary = mongoConnection.useDb(constants.DEFAULT_DB);

    // Find user data
    const userData = await primary
      .model(constants.MODELS.customers, customers)
      .findOne({ name: name });
    if (userData) {
      return responseManager.onSuccess("Customer already exists...!", 0, res);
    } else {
      await primary
        .model(constants.MODELS.customers, customers)
        .create({ name: name });
      return responseManager.onSuccess("Customer Created successfull!", 1, res);
    }
  } catch (error) {
    return responseManager.onError(error, res);
  }
});

router.post("/customerData", helper.authenticateToken, async (req, res) => {
  try {
    if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
      let { name } = req.body;
      const primary = mongoConnection.useDb(constants.DEFAULT_DB);
      const customerData = await primary
        .model(constants.MODELS.expenses, expenses)
        .find({ customer: name });
      if (customerData) {
        return responseManager.onSuccess("customer data.", customerData, res);
      } else {
        return responseManager.onError("customer not found.", res);
      }
    } else {
      return responseManager.badrequest(
        "Invalid token to delete customer, please try again.",
        res
      );
    }
  } catch (error) {
    return responseManager.onError(error, res);
  }
});

module.exports = router;
