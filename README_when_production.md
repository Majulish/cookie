## Cloud stuff

At some point we will go for non-local runs. <br>
when we do that we need to run all the services on cloud.

We will use **google cloud app-engine (GAE)** to run frontend services.<br>

**mongodb atlas** to run mongo services.<br> 

Data queue and caching (*redis* stuff) - run with **google cloud run**,<br>
**memory store** is a complete replacement to the entire *redis* service.<br>

Executor of docker image for running backend services  - **GAE** alternative,<br>
worst case scenario we use managed solution - **google pub sub**<br>

**celery** - python queues library that connects\uses to redis 

nice to have stuff - domain - **go daddy**
cosmos db is microsoft DB solution.

[flowbite](https://flowbite-react.com/docs/getting-started/introduction)
or [mui](https://mui.com/material-ui/)
for styled components, we gotta decide.
