// emailController.js
exports.sendEmail = async (req, res) => {
    try {
      const { to, subject, body } = req.body;
      // Logique pour envoyer un email
      res.status(200).send("Email envoyé avec succès.");
    } catch (error) {
      res.status(500).send(error.message);
    }
  };
  