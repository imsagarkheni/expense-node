let express = require("express");
let router = express.Router();
let mongoose = require('mongoose')
const mongoConnection = require("../../../utils/connections");
const responseManager = require("../../../utils/response.manager");
const usersModel = require('../../../models/users.model');
const helper = require("../../../utils/helper");
const constants = require("../../../utils/constants");

router.get("/userbyId",helper.authenticateToken, async (req, res) => {
    try {
        if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
            let primary = mongoConnection.useDb(constants.DEFAULT_DB);
            let userList = await primary.model(constants.MODELS.users, usersModel).findOne({_id:mongoose.Types.ObjectId(req.token.userid)}).select("-password")
            if(userList != null){
                return responseManager.onSuccess('userData', userList, res);
            }else{
                return responseManager.onSuccess('No Result Found', 0, res);
            }
        }else{
            return responseManager.badRequest({ message: 'Invalid token to send friend request, please try again' }, res);
        }
    } catch (error) {
        return responseManager.onError(error, res);
    }
});
router.get("/list",helper.authenticateToken, async (req, res) => {
    try {
        if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
            let primary = mongoConnection.useDb(constants.DEFAULT_DB);
            let userList = await primary.model(constants.MODELS.users, usersModel).find({}).select("-passowrd")
            if(userList){
                return responseManager.onSuccess('userData', userList, res);
            }else{
                return responseManager.onSuccess('No Result Found', 0, res);
            }
        }else{
            return responseManager.badRequest({ message: 'Invalid token, please try again' }, res);
        }
    } catch (error) {
        return responseManager.onError(error, res);
    }
});
router.post("/delete",helper.authenticateToken, async (req, res) => {
    try {
        if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
            const primary = mongoConnection.useDb(constants.DEFAULT_DB);
            const deletedUser = await primary.model(constants.MODELS.users, usersModel)
                .findByIdAndDelete(req.body.id);
            if (deletedUser) {
                return responseManager.onSuccess('User deleted successfully.', 1, res);
            } else {
                return responseManager.onError('User not found.', res);
            }
        } else {
            return responseManager.badrequest('Invalid token to delete user, please try again.', res);
        }
    } catch (error) {
        return responseManager.onError(error, res);
    }
});
router.post("/updateUser", helper.authenticateToken, async (req, res) => {
    try {
        if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
            const primary = mongoConnection.useDb(constants.DEFAULT_DB);
            const updatedUser = await primary.model(constants.MODELS.users, usersModel)
                .updateOne({_id: mongoose.Types.ObjectId(req.body.id)}, {$set: req.body});
            if (updatedUser) {
                return responseManager.onSuccess('User updated successfully.', 1, res);
            } else {
                return responseManager.onError('User not found.', res);
            }
        } else {
            return responseManager.badRequest('Invalid token to update user, please try again.', res);
        }
    } catch (error) {
        return responseManager.onError(error, res);
    }
});


router.get("/userbyIds", helper.authenticateToken, async (req, res) => {
    try {
        if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
            let primary = mongoConnection.useDb(constants.DEFAULT_DB);
            let userList = await primary.model(constants.MODELS.users, usersModel)
                .findOne({ _id: mongoose.Types.ObjectId(req.query.id) })
                .select("-password");
            if (userList != null) {
                return responseManager.onSuccess('userData', userList, res);
            } else {
                return responseManager.onSuccess('No Result Found', 0, res);
            }
        } else {
            return responseManager.badRequest('Invalid token to send friend request, please try again', res);
        }
    } catch (error) {
        return responseManager.onError(error, res);
    }
});
  
module.exports = router;