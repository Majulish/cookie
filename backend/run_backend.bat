@echo off

:: Activate the virtual environment
call venv\Scripts\activate

:: Set Flask environment variables
set FLASK_APP=app.main
set FLASK_ENV=development

:: Run the Flask application
flask run --host=0.0.0.0 --port=8000

:: Deactivate the virtual environment
deactivate
