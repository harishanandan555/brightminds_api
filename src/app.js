const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const redoc = require('redoc-express');
const YAML = require('yamljs');
const path = require('path');

// Load environment variables
dotenv.config();

// Connect to database
const connectDB = require('./config/db');
connectDB();

// Route files
const auth = require('./routes/auth');
const users = require('./routes/users');
const projects = require('./routes/projects');
const parent = require('./routes/parent');

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors({
    origin: ['https://brightminds-app.onrender.com', 'http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174'],
    credentials: true
}));

// Set security headers
// Set security headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net", "cdn.redoc.ly", "unpkg.com", "blob:"],
            styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
            fontSrc: ["'self'", "fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "cdn.redoc.ly"],
            connectSrc: ["'self'", "blob:"],
            workerSrc: ["'self'", "blob:"],
        },
    },
}));

// Logger
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Mount routers
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/projects', projects);
app.use('/api/v1/parent', parent);

// Documentation
try {
    const swaggerDocument = YAML.load(path.join(__dirname, 'docs', 'openapi.yaml'));
    console.log('Swagger Document Loaded successfully');

    app.get('/api-docs/swagger.json', (req, res) => {
        console.log('Serving swagger.json');
        res.json(swaggerDocument);
    });
} catch (error) {
    console.error('Error loading Swagger Document:', error);
}

app.get(
    '/api-docs',
    redoc({
        title: 'BrightMinds API',
        specUrl: '/api-docs/swagger.json',
        redocOptions: {
            theme: {
                colors: {
                    primary: {
                        main: '#2C3E50',
                    },
                    success: {
                        main: '#27AE60',
                    },
                    warning: {
                        main: '#F39C12',
                    },
                    error: {
                        main: '#C0392B',
                    },
                },
                typography: {
                    fontSize: '16px',
                    fontFamily: 'Roboto, sans-serif',
                    headings: {
                        fontFamily: 'Montserrat, sans-serif',
                        fontWeight: '700',
                    },
                },
                sidebar: {
                    backgroundColor: '#ECF0F1',
                    textColor: '#2C3E50',
                },
            },
            hideDownloadButton: true,
            requiredPropsFirst: true,
            noAutoAuth: true,
        },
    })
);


// Root route
app.get('/', (req, res) => {
    res.send('BrightMinds API is running...');
});

module.exports = app;
