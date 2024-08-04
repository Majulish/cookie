@echo off

:: Activate the virtual environment
call backend\venv\Scripts\activate

:: Run all tests
python -m unittest discover -s backend/tests

:: Deactivate the virtual environment
deactivate
