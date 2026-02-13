@echo off
REM Automated script to rename Edge Function directory and deploy

echo.
echo ================================================
echo  JALA 2 Edge Function Directory Fix
echo ================================================
echo.
echo This will:
echo   1. Rename \supabase\functions\server
echo   2. To: \supabase\functions\make-server-6fcaeea3
echo   3. Deploy the backend
echo.

REM Check if source directory exists
if not exist "supabase\functions\server" (
    echo [WARNING] Directory 'supabase\functions\server' not found.
    echo.
    
    REM Check if already renamed
    if exist "supabase\functions\make-server-6fcaeea3" (
        echo [SUCCESS] Directory already renamed to 'make-server-6fcaeea3'
        echo.
        set /p deploy_choice="Deploy now? (y/n): "
        if /i "%deploy_choice%"=="y" (
            call deploy-backend.bat
        )
        exit /b 0
    )
    
    echo [ERROR] Cannot find server directory!
    pause
    exit /b 1
)

echo [INFO] Found: supabase\functions\server
echo.
set /p proceed="Proceed with rename? (y/n): "

if /i not "%proceed%"=="y" (
    echo [INFO] Operation cancelled.
    pause
    exit /b 0
)

echo.
echo [INFO] Renaming directory...

REM Rename the directory
move supabase\functions\server supabase\functions\make-server-6fcaeea3

REM Verify
if exist "supabase\functions\make-server-6fcaeea3\index.tsx" (
    echo [SUCCESS] Directory renamed successfully!
    echo.
    echo New structure:
    echo   \supabase\functions\make-server-6fcaeea3\
    dir /b supabase\functions\make-server-6fcaeea3
    echo.
    
    REM Ask about deployment
    set /p deploy_choice="Deploy backend now? (y/n): "
    if /i "%deploy_choice%"=="y" (
        echo.
        call deploy-backend.bat
    ) else (
        echo.
        echo [SUCCESS] Rename complete! Run deploy-backend.bat when ready.
    )
) else (
    echo [ERROR] Rename failed!
    pause
    exit /b 1
)

pause
