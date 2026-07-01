async function run() {
  try {
    const res = await fetch('http://localhost:5000/api/v1/attendance/analytics?schoolId=676f4cb12b490484a5fa4172&cohort=&fromDate=&toDate=&term=&session=');
    const data = await res.json();
    console.log("Analytics Response:", data);
  } catch(e) {
    console.error("Error:", e.message);
  }
}
run();
