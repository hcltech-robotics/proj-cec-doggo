# Docker images

## MCAP file replay with ros: rosplay/Dockerfile

`cd rosplay`

Once:

`docker build -t rosplay .`

`export ELEVENLABS_KEY=...` # if you want to use TTS

`docker run --detach --env ELEVENLABS_KEY=${ELEVENLABS_KEY} --publish 8765:8765 --volume /home/user/work/proj-cec-doggo/components/ros-playback/:/data/mcap --name rosplay-container rosplay`

On-demand:

`docker stop rosplay-container`

`docker start rosplay-container`

Cleanup/hard restart

`docker rm rosplay-container`

Info:

`docker ps -a`

`docker logs rosplay-container`
