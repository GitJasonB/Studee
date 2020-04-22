# Studee
Studee Code Challenge

Docker images are now available in DockerHub to install this application locally. 

Please run the following docker commands to get the system running….

**docker network create demo-network**

**docker container run --name mongo-server --network demo-network -d --rm mongo:latest**

**docker run -p 3000:3000 --name node-server --network demo-network -d --rm jasonbrownuk/noderestapp**

Two containers should now be running. The data storage container is empty and so the first thing to do is load the data, so please execute the following steps…..

**docker logs <container_id_of jasonbrownuk/noderestapp>) -f ** 

to see the logs of the node server outputted to the screen.

In a browser, go to **http://ip_address_of_docker_server:3000/load** and observe the logs. Wait for ENDING-DATA-LOAD to appear (approx 10-15 seconds)

The system is now ready to test with Postman. Please see the readme.docx file for further information on testing.
