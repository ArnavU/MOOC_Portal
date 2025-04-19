const mongoose = require('mongoose');
const Course = require('../models/Course');

async function removeCourseCodeIndex() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URL);

        // Get the collection
        const collection = mongoose.connection.collection('courses');

        // Drop the courseCode index
        await collection.dropIndex('courseCode_1');
        
        console.log('Successfully removed courseCode index');
    } catch (error) {
        console.error('Error removing index:', error);
    } finally {
        // Close the connection
        await mongoose.connection.close();
    }
}

// Run the function
removeCourseCodeIndex(); 