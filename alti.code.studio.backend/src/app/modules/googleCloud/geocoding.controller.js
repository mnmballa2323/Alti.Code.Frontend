import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { googleMapsService } from './geocoding.service.js';

const forwardGeocode = catchAsync(async (req, res) => {
    const { address } = req.query;
    
    if (!address) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'address query parameter is required.' });
    }

    const coordinates = await googleMapsService.forwardGeocode(address);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Google Maps forward geocoding completed.',
        data: coordinates,
    });
});

const reverseGeocode = catchAsync(async (req, res) => {
    const { lat, lng } = req.query;
    
    if (!lat || !lng) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'lat and lng query parameters are required.' });
    }

    const address = await googleMapsService.reverseGeocode(parseFloat(lat), parseFloat(lng));

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Google Maps reverse geocoding completed.',
        data: { address },
    });
});

export const GeocodingController = {
    forwardGeocode,
    reverseGeocode
};
