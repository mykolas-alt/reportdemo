import http from 'k6/http';
import { check } from 'k6';


const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';
const USER_ENDPOINT = '/user';
const REGISTER_ENDPOINT = '/register';
const SEED_COUNT = Number(__ENV.SEED_COUNT) || 50_000;
const BATCH_SIZE = 5000;


export const options = {
    stages: [
        { duration: '20s', target: 50 },   // Ramp up
        { duration: '40s', target: 50 },   // Steady load
        { duration: '20s', target: 0 },    // Ramp down
    ],
    thresholds: {
        http_req_duration: ['p(95)<80'],  // tighten after measuring baseline
        http_req_failed: ['rate<0.01'],
    },
    setupTimeout: '10m',  // Increase setup timeout for seeding
};


export function setup() {
    console.log(`Seeding ${SEED_COUNT} users...`);

    let batchedCount = SEED_COUNT / BATCH_SIZE;
    let requestCount = SEED_COUNT;
    for (let batch = 0; batch < batchedCount; batch++) {
        const requests = [];
        for (let i = 0; i < Math.min(requestCount, BATCH_SIZE); i++) {
            let requestNumber = SEED_COUNT - requestCount + i;
            requests.push({
                method: 'POST',
                url: `${BASE_URL}${REGISTER_ENDPOINT}`,
                body: JSON.stringify({
                    email: `user${requestNumber}@test.com`,
                    name: `User ${requestNumber}`,
                    companyName: `company ${requestNumber}`,
                    companyCode: `COMP${requestNumber}`,
                }),
                params: { headers: { 'Content-Type': 'application/json' } },
            });
        }
        const responses = http.batch(requests);

        responses.forEach((res, i) => {
            if (res.status !== 200 && res.status !== 201) {
                console.error(`Failed to seed user ${i}: ${res.status} - ${res.body}`);
            }
        });

        console.log(`Batch ${batch + 1} done.`);
        requestCount -= BATCH_SIZE;
    }

    console.log('Seeding complete.');

    return { seedCount: SEED_COUNT };
}

export default function(data) {
    const randomId = Math.floor(Math.random() * data.seedCount);
    const email = `user${randomId}@test.com`;

    const res = http.get(
        `${BASE_URL}${USER_ENDPOINT}?email=${email}`
    );

    check(res, {
        'status is 200': (r) => r.status === 200,
        'email is correct': (r) => JSON.parse(r.body).email === email,
    });
}
