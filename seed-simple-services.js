const mongoose = require('mongoose');
const config = require('./config/config');
const SimpleService = require('./models/SimpleServices');

const services = [
    {
        name: 'Maid Services',
        type: 'maid',
        category: 'cleaning',
        description: 'Professional home cleaning and housekeeping services'
    },
    {
        name: 'Cook Services', 
        type: 'cook',
        category: 'cooking',
        description: 'Expert chefs and cooks for meal preparation'
    },
    {
        name: 'Driver Services',
        type: 'driver', 
        category: 'transport',
        description: 'Professional drivers for personal transportation'
    },
    {
        name: 'Car Wash Services',
        type: 'carwash',
        category: 'automotive', 
        description: 'Professional car cleaning and detailing services'
    },
    {
        name: 'Deep Cleaning Services',
        type: 'deepcleaning',
        category: 'cleaning',
        description: 'Comprehensive deep cleaning for homes and offices'
    },
    {
        name: 'Pest Control Services',
        type: 'pestcontrol',
        category: 'maintenance',
        description: 'Professional pest control and fumigation services'
    }
];

async function seedSimpleServices() {
    try {
        await mongoose.connect(config.MONGODB_URI);
        console.log('Connected to MongoDB');

        await SimpleService.deleteMany({});
        console.log('Cleared existing services');

        const createdServices = await SimpleService.insertMany(services);
        console.log(`✅ Successfully created ${createdServices.length} services`);

        createdServices.forEach((service, index) => {
            console.log(`${index + 1}. ${service.name} (${service.type})`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating services:', error);
        process.exit(1);
    }
}

seedSimpleServices();