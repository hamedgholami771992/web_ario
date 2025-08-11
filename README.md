running from docker:
    - in terminal be inside the root dir where docker-compose exists
    - modify the env-vars 
    - run "docker compose up -d"
    - run "docker logs -f container-name" to see the log of each container



running inside the local os:
    - change directory to /job-offer-aggregator
    - create .env file with the env-vars specified inside docker-compose 
    - run "npm install"
    - have a postgre database running on a destination specified inside .env file
    - run "npm run migrate:generate-init" to generate the initMigration for creating tables
    - run "npm run migrate:run" to execute the migrations
    - run "npm run seed" to seed the database
    - run "npm run start:scheduler" to run the scheduler service
    - run "npm run start:job-fetcher" to run the job-fetcher service
    - run "npm run start:job-api" to run the job-api service

running tests: 
    - all test altogether => "npm run test"
    - one test file => "npm run test path-to-test-file"   =ex=> npm run test /test/unit/jobs/jobs.service.spec.ts







{
    "title": "Software Engineer",
    "city": "San Francisco",
    "state": "CA",
    "isRemote": true,
    "minSalary": 80000,
    "maxSalary": 120000,
    "currency": "USD",
    "jobType": "Full-time",
    "skills": [
        "TypeScript",
        "NestJS",
        "Node.js"
    ],
    "experience": 3,
    "employerName": "TechCorp",
    "employerIndustry": "Software",
    "fromDate": "2025-08-01T00:00:00Z",
    "toDate":   "2025-08-31T23:59:59Z",
    "page": 1,
    "limit": 20
}