@echo off
title Home Rental Manager
setlocal enabledelayedexpansion

REM =============================================
REM  Home Rental - Start / Restart Batch File
REM  Usage: start.bat [start|stop|restart|help]
REM =============================================

set BACKEND_PORT=3000
set FRONTEND_PORT=5173

if "%1"=="" goto help
if /I "%1"=="help" goto help
if /I "%1"=="start" goto start
if /I "%1"=="stop" goto stop
if /I "%1"=="restart" goto restart

echo Unknown command: %1
goto help

REM =============================================
REM  HELP
REM =============================================
:help
echo.
echo =============================================
echo   Home Rental Manager - Batch Script
echo =============================================
echo.
echo Usage:
echo   start.bat start     Start backend ^& frontend
echo   start.bat stop      Stop all services
echo   start.bat restart   Restart all services
echo   start.bat help      Show this help message
echo.
echo Backend port : %BACKEND_PORT%
echo Frontend port: %FRONTEND_PORT%
echo.
goto :eof

REM =============================================
REM  START
REM =============================================
:start
echo.
echo [INFO] Starting Home Rental services...
echo.

REM Start Backend
echo [1/2] Starting Backend (port %BACKEND_PORT%)...
start "HomeRental-Backend" cmd /c "cd /d "%~dp0backend" && title HomeRental-Backend && npm run dev"

REM Small pause to let backend terminal open
timeout /t 2 /nobreak >nul

REM Start Frontend
echo [2/2] Starting Frontend (port %FRONTEND_PORT%)...
start "HomeRental-Frontend" cmd /c "cd /d "%~dp0frontend" && title HomeRental-Frontend && npm run dev"

echo.
echo [OK] Services started! Close the terminal windows to stop.
echo     Backend  : http://localhost:%BACKEND_PORT%
echo     Frontend : http://localhost:%FRONTEND_PORT%
echo.
goto :eof

REM =============================================
REM  STOP
REM =============================================
:stop
echo.
echo [INFO] Stopping Home Rental services...
echo.

REM Kill backend process on port 3000
echo [1/2] Stopping Backend (port %BACKEND_PORT%)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%BACKEND_PORT%" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)
echo     Done.

REM Kill frontend process on port 5173
echo [2/2] Stopping Frontend (port %FRONTEND_PORT%)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%FRONTEND_PORT%" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)
echo     Done.

echo.
echo [OK] All services stopped.
echo.
goto :eof

REM =============================================
REM  RESTART
REM =============================================
:restart
echo.
echo [INFO] Restarting Home Rental services...
echo.
call :stop
timeout /t 3 /nobreak >nul
call :start
goto :eof

