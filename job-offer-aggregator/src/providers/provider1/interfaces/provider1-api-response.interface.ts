
export interface Provider1Job {
    jobId: string;
    title: string;
    details: {
        location: string;        // city, state, country => e.g. "San Francisco, CA" 
        type: string;            // e.g. "Full-Time"
        salaryRange: string;     // e.g. "$72k - $119k"
    };
    company: {
        name: string;
        industry: string;
    };
    skills: string[];
    postedDate: string;        // ISO string (e.g. 2025-08-02T...)
}

//general fields in both provider1-job and provider2-job
//jobId, title(position), location(`city, state`), salaryRange(`(min-max)currency`), 
// companyName, skills(technologies), postedDate(conversion needed)


//unique fields and exists just in provider1-job
//type, industry


export interface Provider1Metadata {
    requestId: string;
    timestamp: string;       // ISO string
}


export interface Provider1ApiResponse {
    metadata: Provider1Metadata;
    jobs: Provider1Job[];
}

