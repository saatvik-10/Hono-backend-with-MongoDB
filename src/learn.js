import { Hono } from 'hono';
import { v4 as uuid4 } from 'uuid';
import { stream, streamText, streamSSE } from 'hono/streaming';

let videos = [];

const app = new Hono();

app.get('/', (c) => {
  return c.html('<h1>Welcome to HONO!</h1>');
});

app.post('/videos', async (c) => {
  const { videoName, channelName, duration } = await c.req.json();
  const newVideo = {
    id: uuid4(),
    videoName,
    channelName,
    duration,
  };
  videos.push(newVideo);
  return c.json(newVideo);
});

//read all data using stream
app.get('/videos', (c) => {
  return streamText(c, async (stream) => {
    for (const video of videos) {
      await stream.writeln(JSON.stringify(video));
      await stream.sleep(1000);
    }
  });
});

//Read by id
app.get('/videos/:id', (c) => {
  const { id } = c.req.param();
  const video = videos.find((v) => v.id === id);
  if (!video) {
    return c.json({ error: 'Video not found' }, 404);
  }
  return c.json(video);
});

//update
app.put('/videos/:id', async (c) => {
  const { id } = c.req.param();
  const index = videos.findIndex((v) => v.id === id);
  if (index === -1) {
    return c.json({ error: 'Video not found' }, 404);
  }
  const { videoName, channelName, duration } = await c.req.json();
  videos[index] = {
    ...videos[index],
    videoName,
    channelName,
    duration,
  };
  return c.json(videos[index]);
});

//delete a video
app.delete('video/:id', (c) => {
  const { id } = c.req.param();
  videos = videos.filter((v) => v.id !== id);
  return c.json({ message: 'Video deleted successfully' });
});

//delete all videos
app.delete('/videos', (c) => {
  videos = [];
  return c.json({ message: 'All videos deleted successfully' });
});

export default app;
