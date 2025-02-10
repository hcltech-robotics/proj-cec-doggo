# How to start the robot demo playback?

There is a `.mcap` file in the `/components/ros-playback` folder, what we can start with the following docker command:

```bash
docker run -p 8765:8765 -v <file path of mcap>:/data/mcap  -ti tfoldi/go2-demo-playback
```
