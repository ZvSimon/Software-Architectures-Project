import qr from 'qrcode';
import { Request, Response, NextFunction } from 'express';

// Étendez l'interface Request pour ajouter les propriétés qrCodeURL et qrCodeData
interface RequestWithQRCode extends Request {
  qrCodeURL?: string;
  qrCodeData?: string;
}

export async function generateQRCodeMiddleware(req: RequestWithQRCode, res: Response, next: NextFunction) {
    try {
        const url = req.qrCodeURL; // URL à encoder dans le QR code
        if (!url) {
            throw new Error('URL du QR code non fournie');
        }
        const qrCodeData = await qr.toDataURL(url);
        req.qrCodeData = qrCodeData; // Stockez les données du QR code dans la requête pour un accès ultérieur
        next();
    } catch (error) {
        console.error('Erreur lors de la génération du QR code :', error);
        res.status(500).json({ message: 'Erreur lors de la génération du QR code' });
    }
}