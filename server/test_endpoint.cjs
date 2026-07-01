const axios = require('axios');

async function test() {
    try {
        const res = await axios.get('http://127.0.0.1:3100/api/v1/attendance/students-for-attendance', {
            params: { schoolId: '6789008d2f8ed250e6080ed5', presentClass: 'Primary 6' }
            // Note: without auth this might fail, but let's see. Or wait, the user's backend is on 3100.
        });
        console.log("Success:", res.data);
    } catch (err) {
        console.error("Error:", err.response ? err.response.data : err.message);
    }
}
test();
