docker container stop app1 app2 app3
docker container rm app1 app2 app3
docker image rm $(docker images 'my-image' -a -q)