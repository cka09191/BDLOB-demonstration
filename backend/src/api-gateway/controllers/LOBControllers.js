import LOB from '../models/LOB.js';
export async function getLatest4500(req, res) {
    try {
        const lob = await LOB.find().sort({ timestamp: -1 }).limit(4500);
        if (!lob || lob.length !== 4500) {
            if (res === undefined) {
                return null;
            }
            return res.status(404).json({ error: 'LOB not found.' });
        }
        lob.reverse(); // Reverse to have the oldest first
        let formattedLOB = {
            timestamp_first: lob[0].timestamp,
            timestamp_last: lob[lob.length - 1].timestamp,
            book: lob.map(item => item.book)
        };
        if (res === undefined) { // Return the formatted LOB if no response object is provided
            return formattedLOB;
        }
        res.json(formattedLOB);
    } catch (error) {
        console.error('Error fetching latest LOB:', error);
        if (res === undefined) {// Return null if no response object is provided
            return null;
        }
        res.status(500).json({ error: 'Could not fetch latest LOB.' });
    }
}
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