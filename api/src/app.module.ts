import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProdutosModule } from './modules/produtos/produtos.module';
import { CestasModule } from './modules/cestas/cestas.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('POSTGRES_HOST'),
        port: parseInt(config.get<string>('POSTGRES_PORT') ?? '5438', 10),
        username: config.get('POSTGRES_USER'),
        password: config.get('POSTGRES_PASSWORD'),
        database: config.get('POSTGRES_DB'),
        entities: [__dirname + '/**/*.entity.{ts,js}'],
        synchronize: false,
      }),
    }),
    ProdutosModule,
    CestasModule,
  ],
})
export class AppModule {}
