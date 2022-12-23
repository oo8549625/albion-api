### docker run 

```bash
docker pull owen0222/albion-api:latest
docker run -d -e PORT=80 -e REDIS_URL=redis://127.0.0.1:6379 --network host --restart always --name albion-api owen0222/albion-api:latest
docker run -it -d --network host --restart always --name redis -v redis:/data redis:6.2.5
```

