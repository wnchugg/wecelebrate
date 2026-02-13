@echo off
REM Systematic Test Runner for wecelebrate Platform (Windows)
REM Usage: run-systematic-tests.bat [category]

setlocal enabledelayedexpansion

REM Colors aren't well supported in cmd, so we'll use simple output
echo ========================================
echo wecelebrate Systematic Test Runner
echo ========================================
echo.

if "%1"=="" goto interactive
if "%1"=="help" goto usage
if "%1"=="all" goto run_all
goto run_category

:usage
echo Usage: %0 [category^|all^|interactive]
echo.
echo Categories:
echo   type-tests       - Type definition tests
echo   utils            - Utility function tests  
echo   ui-components    - UI component tests
echo   app-components   - Application component tests
echo   admin-components - Admin component tests
echo   contexts         - Context provider tests
echo   services         - Service layer tests
echo   hooks            - Custom hooks tests
echo   pages-user       - User-facing page tests
echo   pages-admin      - Admin page tests
echo   integration      - Integration tests
echo   backend          - Backend tests
echo.
echo Options:
echo   all         - Run all categories
echo   interactive - Interactive mode
echo   [category]  - Run specific category
echo.
goto end

:run_category
set category=%1

if "%category%"=="type-tests" (
  echo Running Type Tests...
  npm test src/app/types/__tests__/ src/types/__tests__/
) else if "%category%"=="utils" (
  echo Running Utility Tests...
  npm test src/app/utils/__tests__/
) else if "%category%"=="ui-components" (
  echo Running UI Component Tests...
  npm test src/app/components/ui/__tests__/
) else if "%category%"=="app-components" (
  echo Running App Component Tests...
  npm test src/app/components/__tests__/
) else if "%category%"=="admin-components" (
  echo Running Admin Component Tests...
  npm test src/app/components/admin/__tests__/
) else if "%category%"=="contexts" (
  echo Running Context Tests...
  npm test src/app/context/__tests__/
) else if "%category%"=="services" (
  echo Running Service Tests...
  npm test src/app/services/__tests__/ src/services/__tests__/
) else if "%category%"=="hooks" (
  echo Running Hook Tests...
  npm test src/app/hooks/__tests__/
) else if "%category%"=="pages-user" (
  echo Running User Page Tests...
  npm test src/app/pages/__tests__/
) else if "%category%"=="pages-admin" (
  echo Running Admin Page Tests...
  npm test src/app/pages/admin/__tests__/
) else if "%category%"=="integration" (
  echo Running Integration Tests...
  npm test src/app/__tests__/
) else if "%category%"=="backend" (
  echo Running Backend Tests...
  npm test supabase/functions/server/tests/
) else (
  echo ERROR: Unknown category '%category%'
  echo.
  goto usage
)
goto end

:run_all
echo Running ALL test categories...
echo.
call :run_category type-tests
call :run_category utils
call :run_category ui-components
call :run_category app-components
call :run_category admin-components
call :run_category contexts
call :run_category services
call :run_category hooks
call :run_category pages-user
call :run_category pages-admin
call :run_category integration
call :run_category backend
goto end

:interactive
echo Choose a test category:
echo.
echo  1. type-tests       - Type definition tests
echo  2. utils            - Utility function tests
echo  3. ui-components    - UI component tests
echo  4. app-components   - Application component tests
echo  5. admin-components - Admin component tests
echo  6. contexts         - Context provider tests
echo  7. services         - Service layer tests
echo  8. hooks            - Custom hooks tests
echo  9. pages-user       - User-facing page tests
echo 10. pages-admin      - Admin page tests
echo 11. integration      - Integration tests
echo 12. backend          - Backend tests
echo.
echo  0. Run All Categories
echo  q. Quit
echo.

set /p choice="Enter your choice: "

if "%choice%"=="0" goto run_all
if "%choice%"=="1" call :run_category type-tests
if "%choice%"=="2" call :run_category utils
if "%choice%"=="3" call :run_category ui-components
if "%choice%"=="4" call :run_category app-components
if "%choice%"=="5" call :run_category admin-components
if "%choice%"=="6" call :run_category contexts
if "%choice%"=="7" call :run_category services
if "%choice%"=="8" call :run_category hooks
if "%choice%"=="9" call :run_category pages-user
if "%choice%"=="10" call :run_category pages-admin
if "%choice%"=="11" call :run_category integration
if "%choice%"=="12" call :run_category backend
if /i "%choice%"=="q" goto end

pause
goto interactive

:end
endlocal
