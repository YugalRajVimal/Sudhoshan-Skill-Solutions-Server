import axios from 'axios';
import qs from 'qs';
import PhonePeOAuthToken from '../Schema/phone_pay.schema.js';

export async function getPhonePeOAuthToken() {
    const url = 'https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token';
    const data = qs.stringify({
        client_id: process.env.PHONEPE_CLIENT_ID,
        client_version: process.env.PHONEPE_CLIENT_VERSION,
        client_secret: process.env.PHONEPE_CLIENT_SECRET,
        grant_type: 'client_credentials'
    });

    try {
        const response = await axios.post(url, data, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const tokenData = response.data;
        if (!tokenData || !tokenData.access_token) {
            throw new Error('Invalid token data returned from PhonePe');
        }

        const issuedAt = Math.floor(Date.now() / 1000);
        const expiresIn = tokenData.expires_in || (tokenData.expiresAt ? tokenData.expiresAt - issuedAt : 3600);
        const expiresAt = issuedAt + expiresIn;

        const phonePeTokenDoc = new PhonePeOAuthToken({
            access_token: tokenData.access_token,
            encrypted_access_token: tokenData.encrypted_access_token || '',
            expires_in: expiresIn,
            issued_at: issuedAt,
            expires_at: expiresAt,
            session_expires_at: tokenData.session_expires_at || expiresAt,
            token_type: tokenData.token_type || 'Bearer'
        });

        await phonePeTokenDoc.save();

        return tokenData;
    } catch (error) {
        console.error('Failed to fetch or save PhonePe OAuth token:', error.response?.data || error.message);
        throw error;
    }
}