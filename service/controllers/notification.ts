// notificationController.js
exports.sendNotification = async (req, res) => {
    try {
      const { userId, title, message } = req.body;
      // Logique pour envoyer une notification
      res.status(200).send("Notification envoyée avec succès.");
    } catch (error) {
      res.status(500).send(error.message);
    }
  };
  