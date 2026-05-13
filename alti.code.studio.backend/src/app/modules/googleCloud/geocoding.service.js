import { Client } from '@googlemaps/google-maps-services-js';
import { logger } from '../../../shared/logger.js';
import config from '../../../../config/index.js';

/**
 * Google Maps Platform Service.
 * Grants the Agent Swarm spatial awareness, allowing it to autonomously
 * convert IP addresses, ZIP codes, and strings into precise geospatial data.
 */
class GoogleMapsService {
    constructor() {
        this.client = new Client({});
        this.apiKey = config.gcp.maps_api_key || 'DUMMY_API_KEY';
        
        if (this.apiKey === 'DUMMY_API_KEY') {
            logger.warn('⚠️ [Geocoding] Google Maps API Key is missing. Geocoding will fail.');
        } else {
            logger.info('🗺️ [Geocoding] Google Maps Platform client initialized.');
        }
    }

    /**
     * Converts an address string into latitude and longitude coordinates.
     * @param {string} address 
     */
    async forwardGeocode(address) {
        logger.info(`🗺️ [Geocoding] Forward geocoding address: "${address}"...`);
        try {
            const response = await this.client.geocode({
                params: {
                    address: address,
                    key: this.apiKey
                }
            });

            if (response.data.results.length > 0) {
                const location = response.data.results[0].geometry.location;
                logger.info(`✅ [Geocoding] Coordinates found: ${location.lat}, ${location.lng}`);
                return location;
            } else {
                logger.warn(`⚠️ [Geocoding] No coordinates found for "${address}".`);
                return null;
            }
        } catch (error) {
            logger.error(`❌ [Geocoding] Forward Geocoding failed:`, error.response?.data?.error_message || error.message);
            return null;
        }
    }

    /**
     * Converts a set of coordinates into an address.
     * @param {number} lat 
     * @param {number} lng 
     */
    async reverseGeocode(lat, lng) {
        logger.info(`🗺️ [Geocoding] Reverse geocoding coordinates: ${lat}, ${lng}...`);
        try {
            const response = await this.client.reverseGeocode({
                params: {
                    latlng: [lat, lng],
                    key: this.apiKey
                }
            });

            if (response.data.results.length > 0) {
                const address = response.data.results[0].formatted_address;
                logger.info(`✅ [Geocoding] Address found: ${address}`);
                return address;
            } else {
                logger.warn(`⚠️ [Geocoding] No address found for coordinates ${lat}, ${lng}.`);
                return null;
            }
        } catch (error) {
            logger.error(`❌ [Geocoding] Reverse Geocoding failed:`, error.response?.data?.error_message || error.message);
            return null;
        }
    }
}

export const googleMapsService = new GoogleMapsService();
