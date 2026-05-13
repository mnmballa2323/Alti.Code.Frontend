import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { FirestoreSyncService } from './firestoreSync.service.js';

const syncCrdt = catchAsync(async (req, res) => {
    // Note: A binary update would typically come over a WebSocket or ArrayBuffer
    const { docName, updateHex } = req.body;
    
    if (!docName || !updateHex) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'docName and updateHex are required.' });
    }

    const updateBinary = Buffer.from(updateHex, 'hex');
    await FirestoreSyncService.persistCrdtUpdate(docName, updateBinary);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'CRDT update synced to globally replicated Firestore.',
    });
});

const loadDoc = catchAsync(async (req, res) => {
    const { docName } = req.params;

    const stateUpdate = await FirestoreSyncService.loadDocState(docName);
    const stateHex = stateUpdate ? Buffer.from(stateUpdate).toString('hex') : null;

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Firestore CRDT state loaded.',
        data: { stateHex },
    });
});

export const FirestoreSyncController = {
    syncCrdt,
    loadDoc
};
