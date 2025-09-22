auth-backend/
├── src/
│   ├── config/
│   │   ├── database.js          # Database configuration
│   │   ├── jwt.js               # JWT configuration
│   │   └── index.js             # Main config file
│   ├── controllers/
│   │   ├── authController.js    # Login/Register handlers
│   │   ├── adminController.js   # Admin panel handlers
│   │   └── fileController.js    # Static file serving
│   ├── middleware/
│   │   ├── auth.js              # JWT verification middleware
│   │   ├── adminAuth.js         # Admin-only access middleware
│   │   ├── validation.js        # Input validation middleware
│   │   └── errorHandler.js      # Global error handling
│   ├── models/
│   │   └── User.js              # User model/schema
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── admin.js             # Admin panel routes
│   │   └── files.js             # File serving routes
│   ├── services/
│   │   ├── authService.js       # Authentication business logic
│   │   ├── tokenService.js      # Token generation/validation
│   │   └── userService.js       # User management logic
│   ├── utils/
│   │   ├── logger.js            # Logging utility
│   │   ├── constants.js         # Application constants
│   │   └── helpers.js           # Helper functions
│   └── app.js                   # Express app configuration
├── public/
│   ├── admin/                   # Admin panel static files
│   │   ├── index.html
│   │   ├── script.js
│   │   └── style.css
│   └── scripts/                 # Protected script files
│       ├── script1.js
│       └── script2.js
├── .env                         # Environment variables
├── .env.example                 # Environment template
├── .gitignore
├── package.json
├── server.js                    # Entry point
└── README.md