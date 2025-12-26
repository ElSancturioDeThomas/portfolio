# Django + React Full-Stack Application

A full-stack web application with Django REST Framework backend and React frontend.

## Project Structure

```
.
├── portfolio/        # Django backend
│   ├── portfolio/    # Django project settings
│   ├── api/          # API app with endpoints
│   ├── manage.py     # Django management script
│   └── requirements.txt
├── frontend/         # React frontend
│   ├── public/       # Static files
│   ├── src/          # React source code
│   └── package.json
└── README.md
```

## Prerequisites

- Python 3.8+ and pip
- Node.js 16+ and npm
- Virtual environment tool (venv or virtualenv)

## Backend Setup (Django)

1. **Navigate to portfolio directory:**
   ```bash
   cd portfolio
   ```

2. **Create and activate virtual environment:**
   ```bash
   python -m venv venv
   # On macOS/Linux:
   source venv/bin/activate
   # On Windows:
   venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env and set your SECRET_KEY
   ```

5. **Run migrations:**
   ```bash
   python manage.py migrate
   ```

6. **Create superuser (optional):**
   ```bash
   python manage.py createsuperuser
   ```

7. **Start Django development server:**
   ```bash
   python manage.py runserver
   ```

   The backend will run on `http://localhost:8000`

## Frontend Setup (React)

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start React development server:**
   ```bash
   npm start
   ```

   The frontend will run on `http://localhost:3000`

## Running the Application

1. **Start Django backend** (in one terminal):
   ```bash
   cd portfolio
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   python manage.py runserver
   ```

2. **Start React frontend** (in another terminal):
   ```bash
   cd frontend
   npm start
   ```

3. **Open your browser:**
   Navigate to `http://localhost:3000` to see the application.

## API Endpoints

- `GET /api/hello/` - Test endpoint that returns a hello message

## Features

- ✅ Django REST Framework for API
- ✅ CORS configured for React frontend
- ✅ Example API endpoint and React component
- ✅ Axios for API calls
- ✅ Modern React hooks (useState, useEffect)
- ✅ Error handling and loading states

## Development

### Adding New API Endpoints

1. Create views in `portfolio/api/views.py`
2. Add URL patterns in `portfolio/api/urls.py`
3. Create corresponding API service functions in `frontend/src/services/api.js`
4. Use the API service in your React components

### Environment Variables

**Backend (.env):**
- `SECRET_KEY` - Django secret key
- `DEBUG` - Debug mode (True/False)

**Frontend (.env):**
- `REACT_APP_API_URL` - Backend API URL (defaults to http://localhost:8000/api)

## Troubleshooting

### CORS Issues
If you encounter CORS errors, ensure:
- Django CORS settings are configured in `portfolio/portfolio/settings.py`
- React app is running on port 3000
- Django is running on port 8000

### Port Already in Use
- Django: Change port with `python manage.py runserver 8001`
- React: Change port by setting `PORT=3001` in `.env` or using `PORT=3001 npm start`

## Next Steps

- Add authentication (JWT tokens)
- Create database models
- Add more API endpoints
- Implement CRUD operations
- Add form validation
- Deploy to production

## License

MIT

