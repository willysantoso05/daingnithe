const express = require('express');
const router = express.Router();

const getAllFilesController = require('../controllers/files/getAllFiles');
const uploadFileController = require('../controllers/files/uploadFile');
const downloadFileController = require('../controllers/files/downloadFile');
const updateFileController = require('../controllers/files/updateFile');
const deleteFileController = require('../controllers/files/deleteFile');
const transferFileController = require('../controllers/files/transferFile');
const shareFileController = require('../controllers/files/shareFile');


router.get('/', getAllFilesController.getAllFiles);
router.post('/', uploadFileController.uploadFile);
// router.get('/:fileId', downloadFileController);

router.put('/:fileId', updateFileController.updateFile);
router.delete('/:fileId', deleteFileController.deleteFile);

router.put('/transfer/:fileId', transferFileController.transferFile);
router.put('/access/:fileId', shareFileController.shareFile);

module.exports = router;