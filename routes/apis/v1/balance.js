let express = require("express");
let router = express.Router();
const mongoConnection = require('../../../utils/connections');
const responseManager = require('../../../utils/response.manager');
const usersModel = require('../../../models/users.model');
const helper = require('../../../utils/helper');
const constants = require('../../../utils/constants');
const { default: mongoose } = require("mongoose");


router.post('/add',helper.authenticateToken, async (req, res) => {
  const { amount } = req.body;
    let primary = mongoConnection.useDb(constants.DEFAULT_DB);
    let userData = await primary.model(constants.MODELS.users, usersModel)
      .findOne({ _id: mongoose.Types.ObjectId(req.token.userid) });
      if (!userData) {
        return responseManager.onError('User not found!', res);
      }
      let newBalance = userData.wallet + parseInt(amount);
      await primary.model(constants.MODELS.users, usersModel)
      .updateOne({ _id: mongoose.Types.ObjectId(req.token.userid) }, { $set: { wallet: newBalance } });
    return responseManager.onSuccess('Balance updated successfully!', newBalance, res);
 });
 module.exports = router;
