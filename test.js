import http from 'k6/http';
import { check } from 'k6';


const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';
const USER_ENDPOINT = '/user';
const REGISTER_ENDPOINT = '/register';
const SEED_COUNT = Number(__ENV.SEED_COUNT) || 10000;


export const options = {
    stages: [
        { duration: '20s', target: 50 },   // Ramp up
        { duration: '40s', target: 50 },   // Steady load
        { duration: '20s', target: 0 },    // Ramp down
    ],
    thresholds: {
        http_req_duration: ['p(95)<200'],  // tighten after measuring baseline
        http_req_failed: ['rate<0.01'],
    },
};


export function setup() {
    console.log(`Seeding ${SEED_COUNT} users...`);

    for (let i = 0; i < SEED_COUNT; i++) {
        const payload = JSON.stringify({
            email: `user${i}@test.com`,
            name: `User ${i}`,
        });

        const res = http.post(
            `${BASE_URL}${REGISTER_ENDPOINT}`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );

        if (res.status !== 200 && res.status !== 201) {
            console.error(`Failed to seed user ${i}: ${res.status} - ${res.body}`)
        }
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
    });
}
