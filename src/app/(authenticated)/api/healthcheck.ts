// src/(unauthenticated)/api/healthcheck.ts

import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        // Perform any necessary health checks here
        const healthStatus = {
            status: 'ok',
            message: 'Application is healthy',
            timestamp: new Date().toISOString(),
        };

        // Respond with the health status JSON object
        res.status(200).json(healthStatus);
    } catch (error) {
        // If an error occurs during the health check, respond with an error status
        res.status(500).json({ status: 'error', message: 'An error occurred during the health check' });
    }
}