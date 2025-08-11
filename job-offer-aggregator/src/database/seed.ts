import dataSource from './data-source';
import { seedCurrencies } from './seeders/currency.seeder';
import { seedProviders } from './seeders/provider.seeder';
import { ProviderEnum } from '../common/enums/provider.enum';
import { Provider } from '../providers-entities/provider.entity';

export async function runSeeders(
  providersData: Omit<Provider, 'id' | 'createdAt'>[] = [
    { name: ProviderEnum.PROVIDER1, address: process.env.PROVIDER1_API_URL },
    { name: ProviderEnum.PROVIDER2, address: process.env.PROVIDER2_API_URL },
  ]
) {
  await dataSource.initialize();


  console.log('🔁 Running migrations...');
  await dataSource.runMigrations();

  console.log('🔁 Running currency seeder...');
  await seedCurrencies(dataSource);

  console.log('🔁 Running provider seeder...');
  await seedProviders(dataSource, providersData);

  console.log('✅ Done.');
  await dataSource.destroy();
  process.exit(0);
}

runSeeders().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
