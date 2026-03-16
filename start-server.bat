@echo off
cd /d "%~dp0"
echo Starting local server on http://localhost:8000
echo.
echo Open this in your browser:
echo   http://localhost:8000/lhon-symbol.html
echo.
echo Keep this window open while you test downloads.
echo Press Ctrl+C to stop.
echo.
python -m http.server 8000
