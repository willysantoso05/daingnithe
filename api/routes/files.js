const express = require('express');
const router = express.Router();

const getAllFilesController = require('../controllers/files/getAllFiles');
const uploadFileController = require('../controllers/files/uploadFile');
// const downloadFileController = require('../controllers/files/downloadFile');
// const updateFileController = require('../controllers/files/updateFile');
// const deleteFileController = require('../controllers/files/deleteFile');
// const shareFileController = require('../controllers/files/shareFile');


router.get('/', getAllFilesController.getAllFiles);
router.post('/', uploadFileController.uploadFile);
// router.get('/:fileId', downloadFileController);

// router.put('/:fileId', updateFileController);
// router.delete('/:fileId', deleteFileController);

// router.put('/access/:fileId', shareFileController);

module.exports = router;