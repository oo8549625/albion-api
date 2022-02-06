### docker run 
```bash
docker pull owen0222/albion-api:latest
docker run -d -e PORT=80 --network host --restart always --name albion-api owen0222/albion-api:latest
docker run -d --network host --restart always --name redis redis:6.2.5
```