@echo off
title Neuraverse
color 0A

cd %~dp0

echo Configuration files checked.

echo Checking dependencies...
if exist "..\node_modules" (
    echo Using node_modules from parent directory...
    cd ..
    CALL npm install
    cd %~dp0
) else (
    echo Installing dependencies in current directory...
    CALL npm install
)
echo Dependencies installation completed!
title Neuraverse
echo Starting the bot...
node index.js

pause
exit
