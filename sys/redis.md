
run redis in docker

```bash
sudo docker stop redis-peekaboo
sudo docker rm redis-peekaboo
sudo docker run -d --name redis-peekaboo -p 6379:6379 redis redis-server
```

redis tools

```bash
sudo apt install redis-tools
```

redis gui

```bash
sudo snap install redis-desktop-manager
```