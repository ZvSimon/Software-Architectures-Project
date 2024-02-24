import jwt from 'jsonwebtoken';
import jwtConfig from '../config/jwt.config'; // Assuming jwt.config.ts exists

const authenticateJWT = (req: any, res: any, next: any): void => {
  // The authorization header normally contains 'Bearer <token>'
  const authHeader: string | undefined = req.headers.authorization;

  // Log the received authHeader for debugging purposes
  console.log('Received authHeader:', authHeader);

  if (!authHeader) {
    return res.status(401).json({ error: 'Missing authentication token.' });
  }

  // Split the authHeader to extract the token
  const parts: string[] = authHeader.split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer') {
    const token: string = parts[1];
    req.token = token;
    // Log the extracted token for debugging purposes
    console.log('Extracted JWT token:', token);

    if (jwtConfig.secret) {
      jwt.verify(token, jwtConfig.secret, (err: any, user: any) => {
          if (err) {
              console.log('JWT verification error:', err); // Log any verification error
              return res.status(403).json({ error: 'Invalid token.' });
          }
  
          req.user = user;
          next();
      });
  } else {
      console.error('jwtConfig.secret est undefined');
      return res.status(500).json({ error: 'Internal server error.' });
  }
}
};

export default authenticateJWT;
