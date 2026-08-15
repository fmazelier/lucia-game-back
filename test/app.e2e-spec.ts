import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('API (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/health (GET) est public', () => {
    return request(app.getHttpServer()).get('/health').expect(200);
  });

  it('/days/today (GET) exige un JWT', () => {
    return request(app.getHttpServer()).get('/days/today').expect(401);
  });

  it('/auth/login (POST) rejette un mauvais PIN', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ login: 'inconnu', pin: '0000' })
      .expect(401);
  });

  afterEach(async () => {
    await app.close();
  });
});
