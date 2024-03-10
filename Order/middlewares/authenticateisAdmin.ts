import { Request, Response, NextFunction } from 'express';
import axios from 'axios';

export const isAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Assurez-vous que l'ID de l'utilisateur est attaché à la requête
    const userId = (req as any).userId; 

    if (!userId) {
      res.status(401).json({ message: 'Non autorisé' });
      return;
    }

    // Récupérez l'utilisateur à partir du service utilisateur
    const response = await axios.get(`http://localhost:8080/api/users/${userId}`);

    const user = response.data;

    if (!user) {
      res.status(404).json({ message: 'Utilisateur non trouvé' });
      return;
    }

    if (user.role !== 'admin') {
      res.status(403).json({ message: 'Accès refusé' });
      return;
    }

    next();
  } catch (error) {
    console.error('Error in isAdmin middleware:', error);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};