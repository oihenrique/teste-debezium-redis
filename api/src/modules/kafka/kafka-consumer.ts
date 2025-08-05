/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Kafka } from 'kafkajs';
import Redis from 'ioredis';

const kafka = new Kafka({
  clientId: 'teste-nest-api',
  brokers: ['localhost:9092'],
});

const consumer = kafka.consumer({ groupId: 'grupo-cestas' });

// conecta ao Redis
const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
});

async function start() {
  await consumer.connect();
  await consumer.subscribe({
    topic: 'dbserver1.public.cestas',
    fromBeginning: true,
  });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const valor = message.value?.toString();
      if (!valor) return;

      const evento = JSON.parse(valor);

      // filtro: apenas eventos de UPDATE
      if (evento.op !== 'u') return;

      const novaCesta = evento.payload.after;

      const cestaTransformada = {
        id: novaCesta.id,
        caixaId: novaCesta.caixa_id,
        status: novaCesta.status.toUpperCase(),
        criadoEm: new Date(novaCesta.criado_em / 1000).toISOString(),
      };

      console.log('🚀 Publicando no Redis:', cestaTransformada);

      // publica no canal "cestas"
      await redis.publish('cestas', JSON.stringify(cestaTransformada));
    },
  });
}

start().catch(console.error);
