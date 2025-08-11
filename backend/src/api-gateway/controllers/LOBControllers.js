import LOB from '../models/LOB.js';

export async function flushExcept4500(req, res) {
    try {
        // More efficient approach: find the 4500th timestamp and delete all records older than that
        const result = await LOB.findOne({}, { timestamp: 1 })
            .sort({ timestamp: -1 })
            .skip(4499); // Get the 4500th newest record (0-indexed)
        
        if (result) {
            // Delete all records with timestamp less than the 4500th newest
            await LOB.deleteMany({ timestamp: { $lt: result.timestamp } });
        }
        
        if (res === undefined) {
            return null; // If no response object is provided, return null
        }
        res.status(200).json({ message: 'LOB entries flushed except the latest 4500.' });
    } catch (error) {
        console.error('Error flushing LOB entries:', error);
        if (res === undefined) {
            return null; // If no response object is provided, return null
        }
        res.status(500).json({ error: 'Could not flush LOB entries.' });
    }
}

export async function getLatest4500(req, res) {
    try {
        const lob = await LOB.find({}, { timestamp: 1, book: 1, _id: 0 })
            .sort({ timestamp: -1 })
            .limit(4500)
            .lean(); // Use lean() for better performance
            
        if (!lob || lob.length === 0) {
            if (res === undefined) {
                return null;
            }
            return res.status(404).json({ error: 'No LOB data found.' });
        }
        
        lob.reverse(); // Reverse to have the oldest first
        
        let formattedLOB = {
            timestamp_first: lob[0].timestamp,
            timestamp_last: lob[lob.length - 1].timestamp,
            book: lob.map(item => item.book),
            count: lob.length
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

export async function getBestLatest4500_1s(req, res) {
    try {
        // Use aggregation pipeline for efficient sampling every 10th record
        const lob = await LOB.aggregate([
            { $sort: { timestamp: -1 } },
            { $limit: 4500 },
            { 
                $group: {
                    _id: null,
                    docs: { $push: "$$ROOT" }
                }
            },
            {
                $project: {
                    sampledDocs: {
                        $map: {
                            input: { $range: [0, 450] },
                            as: "index",
                            in: {
                                $arrayElemAt: ["$docs", { $multiply: ["$$index", 10] }]
                            }
                        }
                    }
                }
            },
            { $unwind: "$sampledDocs" },
            { $replaceRoot: { newRoot: "$sampledDocs" } },
            { $sort: { timestamp: 1 } }, // Sort ascending (oldest first)
            {
                $project: {
                    timestamp: 1,
                    book: {
                        $map: {
                            input: "$book",
                            as: "level",
                            in: [{ $arrayElemAt: ["$$level", 0] }, { $arrayElemAt: ["$$level", 2] }]
                        }
                    }
                }
            }
        ]);

        if (!lob || lob.length === 0) {
            if (res === undefined) {
                return null;
            }
            return res.status(404).json({ error: 'No LOB data found.' });
        }

        let formattedLOB = {
            timestamp_first: lob[0].timestamp,
            timestamp_last: lob[lob.length - 1].timestamp,
            book: lob.map(item => item.book),
            count: lob.length
        };
        
        if (res === undefined) {
            return formattedLOB;
        }
        res.json(formattedLOB);
    } catch (error) {
        console.error('Error fetching latest LOB:', error);
        if (res === undefined) {
            return null;
        }
        res.status(500).json({ error: 'Could not fetch latest LOB.' });
    }
}

export async function getLatestLOB(req, res) {
    try {
        const lob = await LOB.findOne({}, { timestamp: 1, book: 1, _id: 0 })
            .sort({ timestamp: -1 })
            .lean(); // Use lean() for better performance
            
        if (!lob) {
            return res.status(404).json({ error: 'LOB not found.' });
        }
        res.json(lob);
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
        const timestamps = await LOB.find({}, { timestamp: 1, _id: 0 })
            .sort({ timestamp: -1 })
            .lean(); // Use lean() for better performance
            
        res.json(timestamps);
    } catch (error) {
        console.error('Error fetching timestamps:', error);
        res.status(500).json({ error: 'Could not fetch timestamps.' });
    }
}