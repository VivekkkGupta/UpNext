# UpNext

UpNext is a tool designed for streamers on platforms like YouTube, Twitch, or Instagram. It allows streamers to engage their audience by letting them upvote songs, creating a dynamic and interactive music playlist. The most upvoted songs are played next, ensuring the audience has a say in the music selection during live streams.

Creating Docker Container containing redis/redis-stack
docker run -d --name redis-stack -p 6379:6379 -p 5540:5540 redis/redis-stack

docker run -d -p 6379:6379 -p 8001:8001 -p 5540:5540 redis/redis-stack