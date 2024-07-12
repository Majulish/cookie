## Cloud stuff

At some point we will go for non-local runs. <br>
when we do that we need to run all the services on cloud.

We will use **google cloud app-engine (GAE)** to run frontend services,<br>
**mongodb atlas** to run mongo services,<br> 
Data queue and caching with *redis* - run with **memory store** alternative to redis on google cloud, other then **cloud run** container executor of image of docker for running backend services alternative for GAE  <br>
worst case scenario we use managed solution - **google pub sub**
celery - python queues library that connects\uses to redis 

nice to have 
domain - go daddy
cosmos db

[flowbite](https://flowbite-react.com/docs/getting-started/introduction)
or [mui](https://mui.com/material-ui/)
for styled components
