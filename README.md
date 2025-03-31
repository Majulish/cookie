### Getting Started

First, install dependencies:
run:
  ```bash
 cd backend && pip install -r requirements.txt 
 ```
  ```bash
 cd ..
cd frontend 
 ```
```bash
npm install yarn -g && yarn install
```
make the SECRETS.py file under the backend folder with JWT_SECRET_KEY: str 64 long random string, and OPEN_AI_KEY: str key for open ai.

### Running the service

To initialize docker containers, run:
```bash
(cd ./devops/db/ && start_db.bat)
```
To run the frontend service, run:
```bash
(cd ./frontend/ && yarn dev)
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---


