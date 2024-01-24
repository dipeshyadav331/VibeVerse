const router = require("express").Router();
const authController = require("../controllers/authController");
const sendMails = require("../services/emailService");

router.post("/signup", authController.signupController);
router.post("/login", authController.loginController);
router.get("/refresh", authController.refreshAccessTokenController);
router.post("/logout", authController.logoutController);
router.post("/sendemail", authController.sendOTP);
// router.get("/sendemail", sendMails.sendmail);

module.exports = router;