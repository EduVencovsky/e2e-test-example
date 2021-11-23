import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from '../src/product/entities/product.entity';
import { Repository } from 'typeorm';
import { CreateProductDto } from 'src/product/dto/create-product.dto';

describe('ProductController (e2e)', () => {
  let app: INestApplication;
  let productRepository: Repository<Product>;

  const _beforeEach = async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    productRepository = app.get(getRepositoryToken(Product));
  };

  const _afterEach = async () => {
    await productRepository.clear();
    await app.close();
  };

  describe('/product/:id (GET)', () => {
    beforeEach(_beforeEach);
    afterEach(_afterEach);

    it('should get product correctly', async () => {
      const product: CreateProductDto = {
        name: 'test-product',
      };
      const result = await productRepository.save({ ...product });

      const { body, statusCode } = await request(app.getHttpServer()).get(
        `/product/${result.id}`,
      );

      expect(statusCode).toBe(200);
      expect(body).toEqual(expect.objectContaining(product));
    });

    it("should return 404 if product id doesn't exists", async () => {
      const invalidId = 12345;
      const { statusCode } = await request(app.getHttpServer()).get(
        `/product/${invalidId}`,
      );

      expect(statusCode).toBe(404);
    });
  });

  describe('/product (POST)', () => {
    beforeEach(_beforeEach);
    afterEach(_afterEach);

    it('should save product correctly', async () => {
      const product = {
        name: 'test-product',
      };

      const { body, statusCode } = await request(app.getHttpServer())
        .post(`/product`)
        .send(product);

      expect(statusCode).toBe(201);
      expect(body).toEqual(
        expect.objectContaining({
          ...product,
          id: expect.any(Number),
        }),
      );

      const result = await productRepository.findOne(body.id);
      expect(result).toEqual(
        expect.objectContaining({
          ...product,
          id: expect.any(Number),
        }),
      );
    });

    it("shouldn't allow product name to be empty", async () => {
      const emptyName = '';
      const product = {
        name: emptyName,
      };

      const { statusCode } = await request(app.getHttpServer())
        .post(`/product`)
        .send(product);

      expect(statusCode).toBe(400);
    });
  });

  describe('/product/:id (PATCH)', () => {
    beforeEach(_beforeEach);
    afterEach(_afterEach);

    it('should update product correctly', async () => {
      const newName = 'new-test-name';
      const product: CreateProductDto = {
        name: 'test-product',
      };
      const result = await productRepository.save({ ...product });

      const { body, statusCode } = await request(app.getHttpServer())
        .patch(`/product/${result.id}`)
        .send({ name: newName });

      expect(statusCode).toBe(200);
      expect(body).toEqual(expect.objectContaining({ name: newName }));

      const newProduct = await productRepository.findOne(result.id);
      expect(newProduct.name).toEqual(newName);
    });

    it("should return 404 if product id doesn't exists", async () => {
      const invalidId = 12345;
      const newName = 'new-test-name';
      const { statusCode } = await request(app.getHttpServer())
        .patch(`/product/${invalidId}`)
        .send({ name: newName });

      expect(statusCode).toBe(404);
    });

    it("shouldn't allow product name to be empty", async () => {
      const id = 1;
      const emptyName = '';
      const product = {
        name: emptyName,
      };

      const { statusCode } = await request(app.getHttpServer())
        .patch(`/product/${id}`)
        .send(product);

      expect(statusCode).toBe(400);
    });
  });
});
