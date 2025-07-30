import Chart from '../models/Chart.js';


export async function getAllChart(req, res) {
    try {
        const charts = await Chart.find();
        res.json(charts);
    } catch (error) {
        console.error('Error fetching charts:', error);
    }
}

export async function getChart(req, res) {
    try {
        const { _id } = req.params;
        const chart = await Chart.findById(_id);
        if (!chart) {
            return res.status(404).json({ error: 'Chart not found.' });
        }
        res.json(chart);
    } catch (error) {
        console.error('Error fetching chart:', error);
        res.status(500).json({ error: 'Could not fetch chart.' });
    }
}

export async function createChart(req, res) {
    try {
        const { title, content } = req.body;

        const chart = new Chart({ title, content });
        await chart.save();
        res.status(201).json({ message: 'Chart created successfully', chart });
    } catch (error) {
        console.error('Error creating chart:', error);
        res.status(500).json({ error: 'Could not create chart.' });
    }
}

export async function putChart(req, res) {
    try {
        const { _id } = req.params;
        const { title, content } = req.body;

        const chart = await Chart.findByIdAndUpdate(_id, { title, content }, { new: true });
        if (!chart) {
            return res.status(404).json({ error: 'Chart not found.' });
        }
        res.json({ message: 'Chart updated successfully', chart });
    } catch (error) {
        console.error('Error updating chart:', error);
        res.status(500).json({ error: 'Could not update chart.' });
    }
}

export async function deleteChart(req, res) {
    try {
        const { id } = req.params;
        const chart = await Chart.findByIdAndDelete(id);
        if (!chart) {
            return res.status(404).json({ error: 'Chart not found.' });
        }
        res.json({ message: 'Chart deleted successfully' });
    } catch (error) {
        console.error('Error deleting chart:', error);
        res.status(500).json({ error: 'Could not delete chart.' });
    }
}