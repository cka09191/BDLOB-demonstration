let memo = 'This is a memo';
export async function getMemo(req, res) {
    res.json({ message: memo });
}

export async function updateMemo(req, res) {
    try {
        const { title, content } = req.body;
        memo = `Title: ${title}, Content: ${content}`;
        res.json({ message: 'Memo updated successfully', memo });
    } catch (error) {
        console.error('Error updating memo:', error);
        res.status(500).json({ error: 'Could not update memo.' });
    }
    
}