const mongoose = require('mongoose');
const Apartment = require('./models/Apartment');
const config = require('./config/config');

const sampleApartments = [
    {
        name: 'Prestige Lakeside Habitat',
        area: 'Whitefield',
        pincode: '560066',
        landmark: 'Near Forum Value Mall',
        totalUnits: 1200,
        amenities: ['Swimming Pool', 'Gym', 'Club House', 'Children Play Area', 'Parking'],
        managementContact: {
            name: 'Prestige Management',
            phone: '080-67890123',
            email: 'management@prestigelakeside.com'
        },
        isActive: true
    },
    {
        name: 'Brigade Gateway',
        area: 'Rajajinagar',
        pincode: '560010',
        landmark: 'Near Orion Mall',
        totalUnits: 800,
        amenities: ['Swimming Pool', 'Gym', 'Shopping Mall', 'Hotel', 'Office Space'],
        managementContact: {
            name: 'Brigade Management',
            phone: '080-23456789',
            email: 'management@brigadegateway.com'
        },
        isActive: true
    },
    {
        name: 'Mantri Espana',
        area: 'Bellandur',
        pincode: '560103',
        landmark: 'Near Eco Space',
        totalUnits: 600,
        amenities: ['Swimming Pool', 'Gym', 'Tennis Court', 'Badminton Court', 'Jogging Track'],
        managementContact: {
            name: 'Mantri Management',
            phone: '080-45678901',
            email: 'management@mantriespana.com'
        },
        isActive: true
    },
    {
        name: 'Sobha City',
        area: 'Thanisandra',
        pincode: '560077',
        landmark: 'Near Manyata Tech Park',
        totalUnits: 2000,
        amenities: ['Swimming Pool', 'Gym', 'Club House', 'Tennis Court', 'Golf Course'],
        managementContact: {
            name: 'Sobha Management',
            phone: '080-56789012',
            email: 'management@sobhacity.com'
        },
        isActive: true
    },
    {
        name: 'Purva Riviera',
        area: 'Marathahalli',
        pincode: '560037',
        landmark: 'Near Forum Mall',
        totalUnits: 450,
        amenities: ['Swimming Pool', 'Gym', 'Children Play Area', 'Parking', 'Security'],
        managementContact: {
            name: 'Purva Management',
            phone: '080-67890345',
            email: 'management@purvariviera.com'
        },
        isActive: true
    },
    {
        name: 'Embassy Lake Terraces',
        area: 'Hebbal',
        pincode: '560024',
        landmark: 'Near Manyata Embassy Business Park',
        totalUnits: 300,
        amenities: ['Swimming Pool', 'Gym', 'Lake View', 'Jogging Track', 'Club House'],
        managementContact: {
            name: 'Embassy Management',
            phone: '080-78901234',
            email: 'management@embassylake.com'
        },
        isActive: true
    },
    {
        name: 'Godrej Reflections',
        area: 'Electronic City',
        pincode: '560100',
        landmark: 'Near Electronic City Phase 1',
        totalUnits: 750,
        amenities: ['Swimming Pool', 'Gym', 'Children Play Area', 'Parking', 'Shopping Complex'],
        managementContact: {
            name: 'Godrej Management',
            phone: '080-89012345',
            email: 'management@godrejreflections.com'
        },
        isActive: true
    }
];

async function seedApartments() {
    try {
        // Connect to MongoDB
        await mongoose.connect(config.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing apartments
        await Apartment.deleteMany({});
        console.log('Cleared existing apartments');

        // Insert sample apartments
        await Apartment.insertMany(sampleApartments);
        console.log(`Successfully seeded ${sampleApartments.length} apartments`);

        // Display created apartments
        const apartments = await Apartment.find({}).sort({ area: 1, name: 1 });
        console.log('\nCreated apartments:');
        apartments.forEach(apt => {
            console.log(`- ${apt.name} (${apt.area}, ${apt.pincode})`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error seeding apartments:', error);
        process.exit(1);
    }
}

seedApartments();