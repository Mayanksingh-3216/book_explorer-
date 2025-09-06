@echo off
echo Installing Book Explorer Dependencies...
echo ======================================

echo.
echo Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo Backend installation failed!
    pause
    exit /b 1
)

echo.
echo Installing frontend dependencies...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo Frontend installation failed!
    pause
    exit /b 1
)

echo.
echo Installing scraper dependencies...
cd ..\scraper
call npm install
if %errorlevel% neq 0 (
    echo Scraper installation failed!
    pause
    exit /b 1
)

echo.
echo All dependencies installed successfully!
echo.
echo Next steps:
echo 1. Set up environment variables (copy env.example to .env in each directory)
echo 2. Configure MongoDB Atlas connection
echo 3. Run the scraper: cd scraper ^&^& npm start
echo 4. Start the backend: cd backend ^&^& npm run dev
echo 5. Start the frontend: cd frontend ^&^& npm run dev
echo.
pause

