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

[Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.<br>
[Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

---

### stuff in progress

auth.js for authentication page aka login signup.