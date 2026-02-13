@echo off
REM 🔐 Quick Fix Deployment Script for Authentication Errors (Windows)
REM This script deploys the backend with correct settings to fix 401 errors

setlocal enabledelayedexpansion

echo.
echo ========================================
echo 🔐 JALA 2 - Authentication Fix Deployment
echo ========================================
echo.

REM Check if Supabase CLI is installed
where supabase >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Supabase CLI not found!
    echo Install it with: npm install -g supabase
    exit /b 1
)

echo [✓] Supabase CLI found
echo.

REM Prompt for environment
echo Select environment to deploy:
echo   1^) Development ^(wjfcqqrlhwdvvjmefxky^)
echo   2^) Production ^(lmffeqwhrnbsbhdztwyv^)
echo   3^) Both
set /p ENV_CHOICE="Enter choice (1-3): "

if "%ENV_CHOICE%"=="1" (
    set DEPLOY_DEV=true
    set DEPLOY_PROD=false
) else if "%ENV_CHOICE%"=="2" (
    set DEPLOY_DEV=false
    set DEPLOY_PROD=true
) else if "%ENV_CHOICE%"=="3" (
    set DEPLOY_DEV=true
    set DEPLOY_PROD=true
) else (
    echo [ERROR] Invalid choice
    exit /b 1
)

echo.
echo Step 1: Checking function directory structure...

REM Check if function exists
if exist "supabase\functions\make-server-6fcaeea3" (
    echo [✓] Function directory found: supabase\functions\make-server-6fcaeea3
    set FUNCTION_DIR=supabase\functions\make-server-6fcaeea3
) else if exist "supabase\functions\server" (
    echo [!] Function directory is 'server', renaming to 'make-server-6fcaeea3'...
    move supabase\functions\server supabase\functions\make-server-6fcaeea3
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to rename directory
        exit /b 1
    )
    echo [✓] Renamed successfully
    set FUNCTION_DIR=supabase\functions\make-server-6fcaeea3
) else (
    echo [ERROR] Function directory not found!
    echo Expected: supabase\functions\make-server-6fcaeea3 or supabase\functions\server
    exit /b 1
)

echo.
echo Step 2: Authenticating with Supabase...
supabase logout 2>nul
supabase login
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Login failed
    exit /b 1
)
echo [✓] Authenticated successfully

REM Deploy to Development
if "%DEPLOY_DEV%"=="true" (
    echo.
    echo ==========================================
    echo Deploying to DEVELOPMENT
    echo ==========================================
    
    set PROJECT_REF=wjfcqqrlhwdvvjmefxky
    
    echo.
    echo Step 3a: Linking to development project...
    supabase link --project-ref !PROJECT_REF!
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to link to development project
        exit /b 1
    )
    echo [✓] Linked to development project
    
    echo.
    echo Step 4a: Deploying function with --no-verify-jwt...
    supabase functions deploy make-server-6fcaeea3 --project-ref !PROJECT_REF! --no-verify-jwt
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Deployment to development failed
        exit /b 1
    )
    echo [✓] Deployed to development successfully
    
    echo.
    echo Step 5a: Setting environment variables...
    supabase secrets set --project-ref !PROJECT_REF! ALLOWED_ORIGINS="*" 2>nul
    supabase secrets set --project-ref !PROJECT_REF! SEED_ON_STARTUP="false" 2>nul
    echo [✓] Environment variables configured
    
    echo.
    echo Step 6a: Testing development deployment...
    set DEV_URL=https://!PROJECT_REF!.supabase.co/functions/v1/make-server-6fcaeea3/health
    echo Testing: !DEV_URL!
    
    curl -s -f "!DEV_URL!" >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo [✓] Health check passed!
        echo.
        echo Development deployment successful! ✅
        echo URL: !DEV_URL!
        echo Admin: https://jala2-dev.netlify.app/admin
        echo Bootstrap: https://jala2-dev.netlify.app/admin/bootstrap
    ) else (
        echo [!] Health check failed
        echo Try manually: curl !DEV_URL!
    )
)

REM Deploy to Production
if "%DEPLOY_PROD%"=="true" (
    echo.
    echo ==========================================
    echo Deploying to PRODUCTION
    echo ==========================================
    
    set PROJECT_REF=lmffeqwhrnbsbhdztwyv
    
    echo.
    echo Step 3b: Linking to production project...
    supabase link --project-ref !PROJECT_REF!
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to link to production project
        exit /b 1
    )
    echo [✓] Linked to production project
    
    echo.
    echo Step 4b: Deploying function with --no-verify-jwt...
    supabase functions deploy make-server-6fcaeea3 --project-ref !PROJECT_REF! --no-verify-jwt
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Deployment to production failed
        exit /b 1
    )
    echo [✓] Deployed to production successfully
    
    echo.
    echo Step 5b: Setting environment variables...
    supabase secrets set --project-ref !PROJECT_REF! ALLOWED_ORIGINS="https://jala2-dev.netlify.app,https://jala2.netlify.app" 2>nul
    supabase secrets set --project-ref !PROJECT_REF! SEED_ON_STARTUP="false" 2>nul
    echo [✓] Environment variables configured
    
    echo.
    echo Step 6b: Testing production deployment...
    set PROD_URL=https://!PROJECT_REF!.supabase.co/functions/v1/make-server-6fcaeea3/health
    echo Testing: !PROD_URL!
    
    curl -s -f "!PROD_URL!" >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo [✓] Health check passed!
        echo.
        echo Production deployment successful! ✅
        echo URL: !PROD_URL!
    ) else (
        echo [!] Health check failed
        echo Try manually: curl !PROD_URL!
    )
)

echo.
echo ==========================================
echo 🎉 Deployment Complete!
echo ==========================================
echo.
echo Next steps:
echo 1. Create first admin user at: https://jala2-dev.netlify.app/admin/bootstrap
echo 2. Login at: https://jala2-dev.netlify.app/admin
echo 3. Start configuring your platform!
echo.
echo Need help? Check \AUTHENTICATION_FIX_GUIDE.md
echo.

endlocal
