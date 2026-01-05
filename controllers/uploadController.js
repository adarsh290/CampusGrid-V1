import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Upload screenshots
// @route   POST /api/upload/screenshots
// @access  Private/Admin
export const uploadScreenshots = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const uploadDir = 'D:/CampusGrid_Storage/metadata';
    
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const uploadedFiles = [];
    
    // req.files is an array when using multer.array()
    const files = Array.isArray(req.files) ? req.files : [req.files];
    
    for (const file of files) {
      // Generate unique filename
      const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.originalname}`;
      const filePath = path.join(uploadDir, uniqueName);
      
      // Write file to disk (multer stores files in memory with buffer property)
      fs.writeFileSync(filePath, file.buffer);
      
      // Store full path
      uploadedFiles.push(`D:/CampusGrid_Storage/metadata/${uniqueName}`);
    }

    res.status(200).json({
      message: 'Screenshots uploaded successfully',
      files: uploadedFiles,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: error.message });
  }
};

