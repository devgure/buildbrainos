import express from 'express';
import bodyParser from 'body-parser';
import projectRouter from './controllers/project.controller';

const app = express();
app.use(bodyParser.json());

app.get('/health', (_req, res) => res.json({status: 'ok', service: 'project-service'}));
app.use('/projects', projectRouter);

if (require.main === module) {
  const PORT = process.env.PORT || 4003;
  app.listen(PORT, () => console.log(`Project service running on ${PORT}`));
}

export default app;
