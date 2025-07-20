@echo off
echo ========================================
echo Clear Authentication Token
echo ========================================
echo.
echo This will help you test the authentication fix.
echo.
echo To clear the invalid token:
echo 1. Open your browser's Developer Tools (F12)
echo 2. Go to Application/Storage tab
echo 3. Find Local Storage for your domain
echo 4. Delete the 'auth_token' entry
echo.
echo Or run this JavaScript in the console:
echo localStorage.removeItem('auth_token');
echo.
echo Then refresh the page to test the fix.
echo.
pause 