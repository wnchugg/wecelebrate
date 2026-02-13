@echo off
REM JALA 2 Backend Deployment Script (Windows)
REM This script deploys the Supabase Edge Function backend

echo.
echo ================================================
echo  JALA 2 Backend Deployment Script (Windows)
echo ================================================
echo.

REM Check if Supabase CLI is installed
where supabase >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Supabase CLI is not installed.
    echo [INFO] Installing Supabase CLI...
    npm install -g supabase
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install Supabase CLI.
        echo Please install manually: npm install -g supabase
        pause
        exit /b 1
    )
    echo [SUCCESS] Supabase CLI installed!
    echo.
)

REM Ask which environment to deploy to
echo Which environment do you want to deploy to?
echo 1) Development (wjfcqqrlhwdvvjmefxky)
echo 2) Production (lmffeqwhrnbsbhdztwyv)
echo.
set /p env_choice="Enter choice [1-2]: "

if "%env_choice%"=="1" (
    set PROJECT_REF=wjfcqqrlhwdvvjmefxky
    set ENV_NAME=Development
) else if "%env_choice%"=="2" (
    set PROJECT_REF=lmffeqwhrnbsbhdztwyv
    set ENV_NAME=Production
) else (
    echo [ERROR] Invalid choice. Exiting.
    pause
    exit /b 1
)

echo.
echo [INFO] Deploying to: %ENV_NAME% (%PROJECT_REF%)
echo.

REM Login to Supabase
echo [INFO] Checking Supabase authentication...
supabase projects list >nul 2>nul
if %errorlevel% neq 0 (
    echo Please login to Supabase:
    supabase login
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to authenticate.
        pause
        exit /b 1
    )
)
echo [SUCCESS] Authenticated!
echo.

REM Link project
echo [INFO] Linking to Supabase project...
supabase link --project-ref %PROJECT_REF%
if %errorlevel% neq 0 (
    echo [ERROR] Failed to link project.
    pause
    exit /b 1
)
echo [SUCCESS] Project linked!
echo.

REM Deploy Edge Function
echo [INFO] Deploying Edge Function 'make-server-6fcaeea3'...
supabase functions deploy make-server-6fcaeea3 --no-verify-jwt
if %errorlevel% neq 0 (
    echo [ERROR] Deployment failed.
    pause
    exit /b 1
)
echo [SUCCESS] Edge Function deployed!
echo.

REM Test the deployment
echo [INFO] Testing deployment...
set HEALTH_URL=https://%PROJECT_REF%.supabase.co/functions/v1/make-server-6fcaeea3/health
echo Testing: %HEALTH_URL%
echo.

curl -s -f "%HEALTH_URL%" >nul 2>nul
if %errorlevel% equ 0 (
    echo [SUCCESS] Backend is responding!
    echo.
    echo Response:
    curl -s "%HEALTH_URL%"
    echo.
) else (
    echo [WARNING] Backend health check failed.
    echo The function may still be initializing. Please wait 30-60 seconds and try again.
    echo.
)

REM Success message
echo.
echo ================================================
echo  DEPLOYMENT COMPLETE!
echo ================================================
echo.
echo Backend URL: https://%PROJECT_REF%.supabase.co/functions/v1/make-server-6fcaeea3
echo Health Check: %HEALTH_URL%
echo.
echo Next Steps:
echo 1. Go to your admin page and check 'Backend Connection Status'
echo 2. Create an admin user at /admin/bootstrap
echo 3. Run initial database seed at /admin/initial-seed
echo.
echo For more information, see /docs/BACKEND_CONNECTION_FIX.md
echo.
pause