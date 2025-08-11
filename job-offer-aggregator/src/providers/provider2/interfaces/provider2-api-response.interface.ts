export interface Provider2Job {
    position: string;
    location: {
        city: string;
        state: string;
        remote: boolean;
    };
    compensation: {
        min: number;
        max: number;
        currency: string;
    };
    employer: {
        companyName: string;
        website?: string;
    };
    requirements: {
        experience?: number;
        technologies: string[];
    };
    datePosted: string; // ISO date (YYYY-MM-DD)
}

//unique fields and exists just in provider2-job
//remote, website, experience

export interface Provider2Data {
    jobsList: Record<string, Provider2Job>;
}


export interface Provider2ApiResponse {
    status: string;           // e.g. "success"
    data: Provider2Data;
}