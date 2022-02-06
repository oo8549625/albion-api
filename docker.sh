docker logout
docker login -u owen0222 
docker build --no-cache -t owen0222/albion-api:latest -t owen0222/albion-api:v1.0.0 .
docker push owen0222/albion-api:latest
docker push owen0222/albion-api:v1.0.0
