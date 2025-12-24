import express from 'express';
import bodyParser from 'body-parser';
import userRouter from './controllers/user.controller';

const app = express();
app.use(bodyParser.json());

app.get('/health', (_req, res) => res.json({status: 'ok', service: 'user-service'}));
app.use('/users', userRouter);

if (require.main === module) {
  const PORT = process.env.PORT || 4002;
  app.listen(PORT, () => console.log(`User service running on ${PORT}`));
}

export default app;
