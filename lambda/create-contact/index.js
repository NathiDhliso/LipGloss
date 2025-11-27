const https = require('https');

/**
 * AWS Lambda handler for creating HubSpot contacts
 * @param {Object} event - API Gateway event
 * @param {Object} context - Lambda context
 * @returns {Object} API Gateway response
 */
exports.handler = async (event, context) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    // CORS headers for response
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    // Handle OPTIONS preflight request
    if (event.requestContext.http.method === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        // Parse request body
        const body = JSON.parse(event.body || '{}');
        const { name, phone } = body;

        // Validate input
        if (!name || !phone) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    message: 'Name and phone number are required.'
                })
            };
        }

        // Validate phone number is numeric
        const numericPhone = phone.replace(/\D/g, '');
        if (!numericPhone || numericPhone.length < 10 || numericPhone.length > 15) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    message: 'Please provide a valid phone number (10-15 digits).'
                })
            };
        }

        // Get HubSpot API key from environment
        const hubspotApiKey = process.env.HUBSPOT_API_KEY;
        if (!hubspotApiKey) {
            console.error('HubSpot API key not configured');
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({
                    success: false,
                    message: 'Server configuration error.'
                })
            };
        }

        // Create contact in HubSpot
        const contactData = {
            properties: {
                firstname: name.split(' ')[0] || name,
                lastname: name.split(' ').slice(1).join(' ') || '',
                phone: numericPhone,
                hs_lead_status: 'NEW',
                lifecyclestage: 'lead'
            }
        };

        console.log('Creating HubSpot contact:', contactData);

        const hubspotResponse = await createHubSpotContact(contactData, hubspotApiKey);

        console.log('HubSpot response:', hubspotResponse);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Contact created successfully',
                contactId: hubspotResponse.id
            })
        };

    } catch (error) {
        console.error('Error processing request:', error);

        // Handle HubSpot specific errors
        if (error.statusCode === 409) {
            // Contact already exists - this is OK
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    message: 'Contact already exists in our system.'
                })
            };
        }

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                message: 'An error occurred. Please try again later.'
            })
        };
    }
};

/**
 * Create contact in HubSpot using native https module
 * @param {Object} contactData - Contact properties
 * @param {string} apiKey - HubSpot API key
 * @returns {Promise<Object>} HubSpot contact response
 */
function createHubSpotContact(contactData, apiKey) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(contactData);

        const options = {
            hostname: 'api.hubapi.com',
            port: 443,
            path: '/crm/v3/objects/contacts',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
                'Authorization': `Bearer ${apiKey}`
            }
        };

        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject(new Error('Failed to parse HubSpot response'));
                    }
                } else {
                    const error = new Error(`HubSpot API error: ${res.statusCode}`);
                    error.statusCode = res.statusCode;
                    error.response = data;
                    reject(error);
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(postData);
        req.end();
    });
}
