import LOB from '../models/LOB.js';

export async function getLatestLOB(req, res) {
    try {
        const lob = await LOB.find().sort({ timestamp: -1 }).limit(1);
        if (!lob || lob.length === 0) {
            return res.status(404).json({ error: 'LOB not found.' });
        }
        res.json(lob[0]);
    } catch (error) {
        console.error('Error fetching latest LOB:', error);
        res.status(500).json({ error: 'Could not fetch latest LOB.' });
    }
}

export async function createLOB(req, res) {
    try {
        const { timestamp, book } = req.body;

        const lob = new LOB({ timestamp, book });
        await lob.save();
        res.status(201).json({ message: 'LOB created successfully', lob });
    } catch (error) {
        console.error('Error creating LOB:', error);
        res.status(500).json({ error: 'Could not create LOB.' });
    }
}

export async function getAllTimestamp(req, res) {
    try {
        const timestamps = await LOB.find({}, 'timestamp').sort({ timestamp: -1 });
        res.json(timestamps);
    } catch (error) {
        console.error('Error fetching timestamps:', error);
        res.status(500).json({ error: 'Could not fetch timestamps.' });
    }
}