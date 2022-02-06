image=owen0222/albion-api
version=v1.0.0

docker logout
docker login -u owen0222 
docker build --no-cache -t ${image}:latest -t ${image}:${version} .
# docker build --no-cache -t ${image}:latest .
docker push ${image}:latest
docker push ${image}:${version}
