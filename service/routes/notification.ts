// routes.js
const notificationController = require('./notificationController');

router.post('/notifications/send', notificationController.sendNotification);
