import { DataSource } from 'typeorm';
import { Provider } from '../../providers-entities/provider.entity';
import { ProviderEnum } from '../../common/enums/provider.enum';



export async function seedProviders(dataSource: DataSource, providersData: Omit<Provider, "id" | "createdAt">[] = []): Promise<void> {
  const providerRepo = dataSource.getRepository(Provider);

  // upsert takes an array of entities and an array of column names
  // to detect conflicts on.  Here we have @Unique(['address']),
  // so we conflict on address.
  await providerRepo.upsert(
    providersData,
    ['name'],
  );

  console.log(`✅ Inserted ${providersData.length} providers.`);
}
