import { OmitType } from '@nestjs/mapped-types';
import { Product } from '../entities/product.entity';

export class CreateProductDto extends OmitType(Product, [
  'id',
  'createdAt',
  'updatedAt',
]) {}
