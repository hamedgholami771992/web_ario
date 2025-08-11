import { UnifiedJob } from "../../common/interfaces/unified-job.interface";

export interface ProviderTransformer<T> {
    transform(job: T): Promise<UnifiedJob>;
    transform(job: T, jobId: string): Promise<UnifiedJob>;
}