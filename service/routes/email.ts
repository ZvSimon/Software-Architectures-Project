// routes.js
const emailController = require('./emailController');

router.post('/emails/send', emailController.sendEmail);
