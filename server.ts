import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { extractDocumentText } from './server/extractor';
import { computeDocumentDiff } from './server/diffEngine';
import { analyzeWithBharatCodeAI, chatWithDocuments } from './server/bharatCodeService';
import { ComparisonResponse } from './server/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Multer memory storage (never persist uploaded document files to disk)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per document
  },
  fileFilter: (_req, file, cb) => {
    const allowedExtensions = ['.pdf', '.docx', '.txt', '.md', '.rtf'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext) || file.mimetype.includes('text') || file.mimetype.includes('pdf') || file.mimetype.includes('word')) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.originalname}. Only PDF, DOCX, and TXT are supported.`));
    }
  },
});

// GET /api/health
app.get('/api/health', (_req: Request, res: Response) => {
  const hasKey = Boolean(
    process.env.BHARATCODE_API_KEY &&
    process.env.BHARATCODE_API_KEY.trim() !== '' &&
    process.env.BHARATCODE_API_KEY !== 'your_bharatcode_api_key_here'
  );

  res.json({
    status: 'ok',
    service: 'DocuCheck AI Engine',
    bharatCodeConfigured: hasKey,
    model: 'qwen-3.8-27b',
    endpoint: 'https://bharatcode.ai/api/model/v1',
    timestamp: new Date().toISOString(),
  });
});

// POST /api/compare
app.post(
  '/api/compare',
  upload.fields([
    { name: 'originalFile', maxCount: 1 },
    { name: 'updatedFile', maxCount: 1 },
  ]),
  async (req: Request, res: Response) => {
    try {
      let originalText = '';
      let updatedText = '';
      let originalDocumentName = 'Original Document';
      let updatedDocumentName = 'Updated Document';

      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

      // Handle file uploads
      if (files?.originalFile?.[0] && files?.updatedFile?.[0]) {
        const origFile = files.originalFile[0];
        const updFile = files.updatedFile[0];

        originalDocumentName = origFile.originalname;
        updatedDocumentName = updFile.originalname;

        originalText = await extractDocumentText(origFile.buffer, origFile.mimetype, origFile.originalname);
        updatedText = await extractDocumentText(updFile.buffer, updFile.mimetype, updFile.originalname);
      } else if (req.body.originalText && req.body.updatedText) {
        // Direct text payload (e.g. pasted or programmatic)
        originalText = String(req.body.originalText);
        updatedText = String(req.body.updatedText);
        if (req.body.originalDocumentName) originalDocumentName = String(req.body.originalDocumentName);
        if (req.body.updatedDocumentName) updatedDocumentName = String(req.body.updatedDocumentName);
      } else {
        return res.status(400).json({
          error: 'Missing documents. Please provide both an Original Document and an Updated Document.',
        });
      }

      if (!originalText.trim()) {
        return res.status(400).json({
          error: `Original document "${originalDocumentName}" contains no readable text or is password-protected.`,
        });
      }

      if (!updatedText.trim()) {
        return res.status(400).json({
          error: `Updated document "${updatedDocumentName}" contains no readable text or is password-protected.`,
        });
      }

      // Step 5: Compute syntactic diffs
      const { lineDiffs, statistics } = computeDocumentDiff(originalText, updatedText);

      // Step 6: Query BharatCode AI (with local fallback if key unconfigured)
      const aiAnalysis = await analyzeWithBharatCodeAI(originalText, updatedText, lineDiffs);

      const comparisonResponse: ComparisonResponse = {
        id: `comp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        originalDocumentName,
        updatedDocumentName,
        timestamp: new Date().toISOString(),
        originalText,
        updatedText,
        statistics,
        lineDiffs,
        aiAnalysis,
      };

      return res.json(comparisonResponse);
    } catch (err: any) {
      console.error('Error during document comparison:', err);
      return res.status(500).json({
        error: err.message || 'An unexpected error occurred while processing the documents.',
      });
    }
  }
);

// POST /api/demo-compare (Instant high-fidelity demo samples)
app.post('/api/demo-compare', async (req: Request, res: Response) => {
  try {
    const demoType = req.body.demoType || 'employment';

    let originalText = '';
    let updatedText = '';
    let originalDocumentName = '';
    let updatedDocumentName = '';

    if (demoType === 'legal_nda') {
      originalDocumentName = 'Acronis_NDA_v1.0_Original.docx';
      updatedDocumentName = 'Acronis_NDA_v2.0_Final.docx';
      originalText = `NON-DISCLOSURE & PROPRIETARY RIGHTS AGREEMENT
Parties: Acronis Technologies Pvt Ltd ("Disclosing Party") & Bharat Data Systems ("Receiving Party")
Effective Date: 15 March 2025
Term of Confidentiality: 3 Years from the date of disclosure
Governing Law & Jurisdiction: Courts of New Delhi, India
Permitted Purpose: Technical evaluation of B2B payment gateway integration
Standard of Care: Reasonable degree of care no less than that used for own proprietary data
Indemnification: Receiving Party agrees to indemnify Disclosing Party for direct damages up to ₹50,00,000 in case of proven breach.
Return of Materials: Within 14 days of written request.`;

      updatedText = `NON-DISCLOSURE & PROPRIETARY RIGHTS AGREEMENT
Parties: Acronis Technologies Pvt Ltd ("Disclosing Party") & Bharat Data Systems ("Receiving Party")
Effective Date: 22 March 2025
Term of Confidentiality: 1 Year from the date of disclosure
Governing Law & Jurisdiction: Courts of Bengaluru, Karnataka, India
Permitted Purpose: Technical evaluation of B2B payment gateway and consumer lending integrations
Standard of Care: Commercial reasonable degree of care
Non-Compete Covenant: Neither party shall solicit or recruit key technical engineering personnel for a period of 12 months.
Return of Materials: Within 30 days of written request.`;
    } else {
      // Default employment contract sample
      originalDocumentName = 'Employment_Offer_Rahul_Sharma_Original.pdf';
      updatedDocumentName = 'Employment_Offer_Rahul_Sharma_Revision.pdf';
      originalText = `EMPLOYMENT OFFER & APPOINTMENT LETTER
Employee Name: Rahul Sharma
Employee ID: EMP-4029
Department: Engineering
Designation: Senior Software Engineer
Annual Salary: ₹6,00,000
Performance Bonus: Up to 10% based on annual performance review
Joining Date: 01 January 2025
Work Location: Delhi
Working Hours: 9:30 AM to 6:30 PM (Monday to Friday)
Probation Period: 3 Months
Notice Period: 60 Days`;

      updatedText = `EMPLOYMENT OFFER & APPOINTMENT LETTER
Employee Name: Rahul Sharma
Employee ID: EMP-4029
Department: Product Engineering
Designation: Staff Software Engineer
Annual Salary: ₹7,20,000
Performance Bonus: Up to 15% linked to quarterly company metrics
Joining Date: 01 January 2025
Work Location: Noida
Working Hours: Flexible 40 hours per week (Hybrid model)
Probation Period: 3 Months
Notice Period: 90 Days`;
    }

    const { lineDiffs, statistics } = computeDocumentDiff(originalText, updatedText);
    const aiAnalysis = await analyzeWithBharatCodeAI(originalText, updatedText, lineDiffs);

    const comparisonResponse: ComparisonResponse = {
      id: `demo_${Date.now()}`,
      originalDocumentName,
      updatedDocumentName,
      timestamp: new Date().toISOString(),
      originalText,
      updatedText,
      statistics,
      lineDiffs,
      aiAnalysis,
    };

    return res.json(comparisonResponse);
  } catch (err: any) {
    console.error('Error during demo comparison:', err);
    return res.status(500).json({
      error: err.message || 'An error occurred generating demo comparison.',
    });
  }
});

// POST /api/chat-comparison (Interactive grounded document Q&A)
app.post('/api/chat-comparison', async (req: Request, res: Response) => {
  try {
    const { originalText, updatedText, originalDocumentName, updatedDocumentName, messages } = req.body;

    if (!originalText && !updatedText) {
      return res.status(400).json({
        error: 'Missing document context for chat. Please upload documents first.',
      });
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: 'Messages list is required.',
      });
    }

    const chatResponse = await chatWithDocuments(
      originalText || '',
      updatedText || '',
      originalDocumentName || 'Original Document',
      updatedDocumentName || 'Updated Document',
      messages
    );

    return res.json(chatResponse);
  } catch (err: any) {
    console.error('Error in chat-comparison:', err);
    return res.status(500).json({
      error: err.message || 'An error occurred while answering document chat question.',
    });
  }
});

// Configure Vite middleware in development or static serving in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DocuCheck AI server running at http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}
