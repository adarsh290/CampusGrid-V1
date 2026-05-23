import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

// @desc    Upload screenshots
// @route   POST /api/upload/screenshots
// @access  Private/Admin
export const uploadScreenshots = async (req: Request, res: Response) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const storagePath = process.env.GAME_STORAGE_PATH || '/storage';
    const uploadDir = path.join(storagePath, 'metadata');

    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const uploadedFiles: string[] = [];

    // req.files is an array of Express.Multer.File
    for (const file of req.files) {
      // Generate unique filename
      const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.originalname}`;
      const filePath = path.join(uploadDir, uniqueName);

      // Write file to disk (multer stores files in memory with buffer property)
      fs.writeFileSync(filePath, file.buffer);

      // Bug 17 fixed: use forward-slash paths for URLs so they work correctly
      // regardless of the OS the server is running on (Linux in Docker).
      const urlPath = [storagePath, 'metadata', uniqueName].join('/');
      uploadedFiles.push(urlPath);
    }

    res.status(200).json({
      message: 'Screenshots uploaded successfully',
      files: uploadedFiles,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ message: error.message });
  }
};
