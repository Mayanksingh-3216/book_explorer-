@echo off
echo Setting up Book Explorer Environment...
echo ======================================

echo.
echo Creating .env files from templates...

copy backend\env-template backend\.env
if %errorlevel% neq 0 (
    echo Failed to create backend .env file
    pause
    exit /b 1
)

copy scraper\env-template scraper\.env
if %errorlevel% neq 0 (
    echo Failed to create scraper .env file
    pause
    exit /b 1
)

copy frontend\env-template frontend\.env
if %errorlevel% neq 0 (
    echo Failed to create frontend .env file
    pause
    exit /b 1
)

echo.
echo ✅ Environment files created successfully!
echo.
echo 📋 IMPORTANT: You need to configure MongoDB Atlas:
echo.
echo 1. Go to https://cloud.mongodb.com/
echo 2. Create a free account if you don't have one
echo 3. Create a new cluster
echo 4. Create a database named 'book_explorer'
echo 5. Create a user with read/write permissions
echo 6. Whitelist your IP address (or use 0.0.0.0/0 for development)
echo 7. Get your connection string
echo 8. Update the MONGODB_URI in backend\.env and scraper\.env
echo.
echo Example connection string format:
echo MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/book_explorer?retryWrites=true^&w=majority
echo.
echo After configuring MongoDB, you can start the application:
echo.
echo Terminal 1: cd backend ^&^& npm run dev
echo Terminal 2: cd scraper ^&^& npm start  
echo Terminal 3: cd frontend ^&^& npm run dev
echo.
pause

