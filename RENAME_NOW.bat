@echo off
REM Rename Edge Function Directory (Windows)

echo.
echo ================================================
echo  Renaming Edge Function Directory (Windows)
echo ================================================
echo.

REM Check if server directory exists
if exist "supabase\functions\server" (
    echo [OK] Found 'server' directory
    echo [INFO] Renaming to 'make-server-6fcaeea3'...
    
    REM Remove target directory if it exists
    if exist "supabase\functions\make-server-6fcaeea3" (
        echo [WARN] Target directory already exists, removing it first...
        rmdir /s /q "supabase\functions\make-server-6fcaeea3"
    )
    
    REM Rename
    move "supabase\functions\server" "supabase\functions\make-server-6fcaeea3"
    
    if %errorlevel% equ 0 (
        echo [SUCCESS] Renamed successfully!
        echo.
        echo [INFO] Current structure:
        dir supabase\functions
        echo.
        echo [SUCCESS] Ready to deploy!
        echo.
        echo Next step: Run deploy-backend.bat
    ) else (
        echo [ERROR] Rename failed!
        pause
        exit /b 1
    )
) else (
    if exist "supabase\functions\make-server-6fcaeea3" (
        echo [OK] Directory already correctly named: make-server-6fcaeea3
        echo.
        echo [INFO] Current structure:
        dir supabase\functions
        echo.
        echo [SUCCESS] Ready to deploy!
        echo.
        echo Next step: Run deploy-backend.bat
    ) else (
        echo [ERROR] Cannot find Edge Function directory!
        echo.
        echo Expected: supabase\functions\server
        echo Or: supabase\functions\make-server-6fcaeea3
        echo.
        echo Current directory contents:
        dir supabase\functions 2>nul || echo Directory does not exist!
        pause
        exit /b 1
    )
)

pause
