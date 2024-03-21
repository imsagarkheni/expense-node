let express = require("express");
let router = express.Router();
const mongoConnection = require('../../../utils/connections');
const responseManager = require('../../../utils/response.manager');
const usersModel = require('../../../models/users.model');
const helper = require('../../../utils/helper');
const constants = require('../../../utils/constants');


router.post('/register', async (req, res) => {
  const { name, mobile, email, password } = req.body;
    let primary = mongoConnection.useDb(constants.DEFAULT_DB);
    let userdata = await primary.model(constants.MODELS.users, usersModel).findOne( { email: email }).lean();
    if(userdata != null){
        return responseManager.badrequest({ message: 'User already exist with same email, Please try again...' }, res);
    }else {
            let obj = {
                email : email,
                mobile:mobile,
                password : password,
                name : name
            };
            await primary.model(constants.MODELS.users, usersModel).create(obj);
            return responseManager.onSuccess('User Registered successfully!', 1, res);
            }
 });

router.post('/login', async (req, res) => {
    console.log("req",req.body);
    let { email, password } = req.body;
    let primary = mongoConnection.useDb(constants.DEFAULT_DB);
    let userdata = await primary.model(constants.MODELS.users, usersModel).findOne({ email: email }).lean();
    if(userdata != null){
        if(userdata.password == password){
            let accessToken = await helper.generateAccessToken({ userid : userdata._id.toString() });
            res.cookie('userToken', accessToken, {
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000,
              });
            return responseManager.onSuccess('login successfully!', {token : accessToken}, res);
        }else{
            return responseManager.onSuccess('Invalid email or password!',0, res);  
        }
        return responseManager.onSuccess('Invalid email or password!',0, res);
    }else{
        return responseManager.onSuccess('User Not Found!!!',0, res);
    }

});
 module.exports = router;
