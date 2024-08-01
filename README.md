### Getting Started

First, install dependencies:

```bash
npm install yarn -g && yarn install
```

### Running the service

To initialize docker containers, run:
```bash
(cd ./devops/db/ && start_db.bat)
```
To run the frontend service, run:
```bash
(cd ./frontend_service/ && yarn dev)
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

### stuff in progress

authentication page aka login signup.