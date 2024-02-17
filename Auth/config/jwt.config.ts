// terminal : openssl rand -hex 32
interface Config {
  secret: string | undefined;
  expiresIn: string;
}

const config: Config = {
  secret: process.env.JWT_SECRET,
  expiresIn: '3h', 
};
export default config;