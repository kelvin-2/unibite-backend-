# Campus Snacks Backend - Production Ready

## 🏗️ Scalable Architecture

```
campus-snacks-backend/
├── config/               # Configuration files
│   ├── database.js       # Database connection
│   └── jwt.js            # JWT configuration
├── controllers/          # Business logic
│   ├── authController.js
│   ├── productController.js
│   ├── cartController.js
│   ├── orderController.js
│   └── adminController.js
├── middleware/           # Express middleware
│   ├── auth.js           # Authentication
│   └── validate.js       # Input validation
├── models/               # Database models
│   ├── User.js
│   ├── Product.js
│   ├── Cart.js
│   └── Order.js
├── routes/               # API routes
│   ├── auth.js
│   ├── products.js
│   ├── cart.js
│   ├── orders.js
│   └── admin.js
├── .env                  # Environment variables
├── .gitignore
├── package.json
├── README.md
└── server.js             # Entry point
```

## ✨ Features

- ✅ **MVC Architecture** - Scalable and maintainable
- ✅ **INT AUTO_INCREMENT** for user_id (not UUID)
- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Password Hashing** - bcrypt
- ✅ **Input Validation** - express-validator
- ✅ **Error Handling** - Comprehensive error responses
- ✅ **CORS Configured** - Ready for frontend
- ✅ **Transaction Support** - For orders
- ✅ **Admin Panel** - Separate admin routes

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd campus-snacks-backend
npm install
```

### 2. Configure Environment
Edit `.env`:
```env
DB_PASSWORD=your_mysql_password
JWT_SECRET=change_this_to_random_string
```

### 3. Create Database
```bash
mysql -u root -p < ../campus_snacks.sql
```

### 4. Start Server
```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get profile (protected)

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product
- `GET /api/products/search?q=chips` - Search products

### Cart (Protected)
- `POST /api/cart/add` - Add to cart
- `GET /api/cart` - Get cart
- `PUT /api/cart/update` - Update quantity
- `DELETE /api/cart/remove` - Remove item
- `DELETE /api/cart/clear` - Clear cart

### Orders (Protected)
- `POST /api/orders/create` - Create order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:orderId` - Get order details

### Admin (Admin Protected)
- `POST /api/admin/login` - Admin login
- `GET /api/admin/orders` - Get active orders
- `PATCH /api/admin/orders/:orderId/status` - Update status
- `GET /api/admin/products/low-stock` - Low stock products
- `PATCH /api/admin/products/:productId/stock` - Update stock
- `GET /api/admin/stats` - Dashboard stats

## 💻 Example Usage

### Register
```javascript
const response = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        email: 'student@example.com',
        password: 'password123',
        full_name: 'John Doe',
        phone: '0821234567'
    })
});

const data = await response.json();
// { success: true, token: "...", user: { user_id: 1, ... } }
```

### Add to Cart
```javascript
const token = localStorage.getItem('token');

const response = await fetch('http://localhost:3000/api/cart/add', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
        product_id: 1,
        quantity: 2
    })
});
```

## 🔧 Scaling Guide

### Ready to Scale:
1. **Add More Controllers** - Keep adding to `controllers/`
2. **Add More Models** - Keep adding to `models/`
3. **Add More Routes** - Keep adding to `routes/`
4. **Add Services** - Create `services/` for complex logic
5. **Add Tests** - Create `tests/` folder

### Future Enhancements:
- Add Redis for caching
- Add rate limiting
- Add file uploads
- Add email service
- Add payment gateway
- Add WebSocket for real-time

## 📦 Dependencies

```json
{
  "express": "Web framework",
  "mysql2": "Database driver",
  "bcrypt": "Password hashing",
  "jsonwebtoken": "JWT authentication",
  "cors": "CORS middleware",
  "dotenv": "Environment variables",
  "express-validator": "Input validation"
}
```

## 🎯 Design Decisions

### Why INT instead of UUID?
- ✅ Simpler for campus project
- ✅ Faster joins
- ✅ Easier debugging (readable IDs)
- ✅ Less storage space
- ✅ Auto-increment is clean

### Why MVC Architecture?
- ✅ Separation of concerns
- ✅ Easy to test
- ✅ Easy to scale
- ✅ Industry standard
- ✅ Team-friendly

### Why Models?
- ✅ Reusable database logic
- ✅ Single source of truth
- ✅ Easy to modify queries
- ✅ Keeps controllers clean

## 🐛 Troubleshooting

### Database Connection Error
```
❌ Database connection failed
```
**Fix:** Check `.env` DB_PASSWORD

### Port in Use
```
Error: EADDRINUSE
```
**Fix:** Change PORT in `.env` or kill process

### JWT Error
```
Invalid or expired token
```
**Fix:** Login again to get new token

## 📚 Next Steps

1. **Build Frontend** - React/Vue app
2. **Connect to Backend** - Use fetch/axios
3. **Test Everything** - Use Postman
4. **Deploy** - Heroku, Railway, Render

## ✅ Production Checklist

Before deploying:
- [ ] Change JWT_SECRET to strong random string
- [ ] Change DB_PASSWORD
- [ ] Enable HTTPS
- [ ] Add rate limiting
- [ ] Add logging service
- [ ] Set up monitoring
- [ ] Add automated backups
- [ ] Write tests

## 🤝 Contributing

This is a learning project. Feel free to:
- Add features
- Improve code
- Fix bugs
- Add tests

## 📄 License

MIT License - Free to use!

---

**Built with ❤️ for Campus Snack Shop**
