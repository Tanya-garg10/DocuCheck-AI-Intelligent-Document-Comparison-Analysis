import { app } from '../server';

// Disable Vercel's built-in body parser so multer can handle
// multipart/form-data uploads and express.json handles JSON bodies.
export const config = {
  api: {
    bodyParser: false,
  },
};

export default app;
