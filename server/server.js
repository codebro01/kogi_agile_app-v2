import 'dotenv/config'
import 'express-async-error'
import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import xssClean from 'xss-clean'
import mongoSanitize from 'express-mongo-sanitize'
import csurf from 'csurf'
import morgan from 'morgan'
import enforceSSL from 'express-enforces-ssl'
import { connectDB } from './db/connectDB.js'
import { notFound } from './middlewares/notFoundMiddleware.js'
import { customErrorHandler } from './middlewares/errorMiddleware.js'
import { Student } from './models/studentsSchema.js'
import cookieParser from 'cookie-parser'
import {
  adminAuthRouter,
  paymentRouter,
  registrarAuthRouter,
  studentsRouter,
  allSchoolsRouter,
  payrollSpecialistRouter,
  schoolsRouter,
  attendanceRouter,
  verifierRouter
} from './routes/index.js'
import {
  authMiddleware,
  authorizePermission,
} from './middlewares/authenticationMiddleware.js'
import session from 'express-session'
import cors from 'cors'
import XLSX from 'xlsx'
import mongoose from 'mongoose'
import { Registrar } from './models/registrarSchema.js'
import sanitizeHtml from 'sanitize-html'
import { wards } from './routes/index.js'
const app = express()
import { KogiLga } from './models/LgaSchema.js'
// import { Student } from './models/studentsSchema.js'

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.',
  headers: true,
})

// app.use(helmet());

// app.options('*', cors()); // Preflight requests

const allowedOrigins = [
  'https://www.enrolment.kogiagile.org',
  'https://enrolment.kogiagile.org',
  'https://portal.kogiagile.org',
  'https://verifier.kogiagile.org',
  'https://enrollment.kogiagile.org',
  'https://www.enrollment.kogiagile.org',
  'https://www.portal.kogiagile.org',
  'https://www.verifier.kogiagile.org',
  'https://cct.kogiagile.org',
  'https://www.cct.kogiagile.org',
  'https://www.verifier.kogiagile.org',
  'www.portal.kogiagile.org',
  'https://www.cct.kogiagile.org',
  'https://reactbuildapp.onrender.com',
  'https://server-e1e8.onrender.com',
  'http://portal.localhost:3000',
  'http://enrollment.localhost:3000',
  'http://enrolment.localhost:3000',
  'http://cct.localhost:3000',
  'http://verifier.localhost:3000',
  'https://server-g10x.onrender.com',
  // 'https://calm-stardust-05aabe.netlify.app',
  // 'https://kogi-agile-app-vite.vercel.app',
  // 'https://server-nu-khaki-78.vercel.app',
  'https://miscct.kogiagile.org',
]

// CORS middleware

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

// Handle preflight requests
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*')
    res.header(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS'
    )
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    res.header('Access-Control-Allow-Credentials', 'true')
    return res.sendStatus(204)
  }
  next()
})

app.use(cookieParser(process.env.JWT_SECRET))
app.use(express.json())
app.use(express.urlencoded({ limit: '10kb', extended: true }))
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Set 'secure' in production
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      sameSite: 'Lax', // Prevent CSRF
    },
  })
)

//Routes

// app.get('/', (req, res) => {
//     res.send('Welcome to kogi agile api........')
// })
// app.get('/lgas', async (req, res) => {
//     const kogilgas = await KogiLga.find({});
//     res.json({ kogilgas })
// })

app.use('/api/v1/admin-admin', adminAuthRouter)
app.use('/api/v1/admin-enumerator', registrarAuthRouter)
app.use('/api/v1/payroll-specialists', payrollSpecialistRouter)
app.use('/api/v1/student', authMiddleware, studentsRouter)
app.use('/api/v1/all-schools', allSchoolsRouter)
app.use('/api/v1/schools', schoolsRouter)
app.use('/api/v1/wards', wards)
app.use('/api/v1/payments', paymentRouter)
app.use('/api/v1/attendance', attendanceRouter)
app.use('/api/v1/verifier', verifierRouter)

// app.get("*", (req, res) => {
//     res.sendFile(path.join(__dirname, "client/build", "index.html"));
// });

const PORT = process.env.PORT || 3100

app.use(notFound)
app.use(customErrorHandler)

const startDB = async () => {
  try {
    await connectDB(process.env.MONGO_URI)
    // const primary = await PrimarySchools.find({});
    // const secondary = await Schools.find({});

    // const allSchools = [...primary, ...secondary];

    // await AllSchools.insertMany(allSchools);

    app.listen(PORT, () => {
      console.log('app connected to port:' + PORT)
    })

    // const updateLGAs = async () => {
    //     try {
    //      await Student.updateMany({lgaOfEnrollment: "YAGBAWEST"}, {
    //          $set: {
    //              lgaOfEnrollment: "YAGBA-WEST"
    //          }
    //      })

    //      const check = await Student.find({lgaOfEnrollment: "YAGBAWEST"})

    //      console.log(check,'successful')
    //     }
    //     catch(error) {
    //      console.error(error)
    //     }
    //  }


const resp = await Student.updateMany({
  _id: {
    $in: [
      '67d160b706bd731dfe68cbac',
      '67879400360f92251e6818a1',
      '67879b6c360f92251e6819d8',
      '67850854360f92251e680128',
      '6784dd76360f92251e67ff20',
      '67879400360f92251e6818a2',
      '6784dd77360f92251e67ff28',
      '68849b16da6c33438d12c187',
      '678656b5360f92251e680bd2',
      '67850856360f92251e68012d',
      '6787ad2d360f92251e681c3a',
      '67879401360f92251e6818a7',
      '67879b6b360f92251e6819d4',
      '68849b16da6c33438d12c188',
      '6784eb09360f92251e67ff9c',
      '67879401360f92251e6818a6',
      '6787b2d3360f92251e681d3a',
      '6784dd78360f92251e67ff29',
      '67879b6a360f92251e6819cb',
      '6784fefb360f92251e680068',
      '67879402360f92251e6818ae',
      '67879403360f92251e6818b2',
      '6784fefa360f92251e68005f',
      '6784fef8360f92251e680059',
      '67879b6a360f92251e6819ce',
      '6784dd77360f92251e67ff27',
      '6784c97e360f92251e67fed4',
      '6784eb09360f92251e67ff9a',
      '67d1545306bd731dfe68c49d',
      '6784fefc360f92251e68006c',
      '6784fefa360f92251e680060',
      '6784c97e360f92251e67fed5',
      '678793ff360f92251e68189d',
      '6784fef8360f92251e680057',
      '6784fef9360f92251e68005c',
      '67d15c1206bd731dfe68c969',
      '6784eb08360f92251e67ff95',
      '6784fefb360f92251e680069',
      '67879403360f92251e6818b1',
      '67879b71360f92251e6819f1',
      '6784d1aa360f92251e67feee',
      '6784eb08360f92251e67ff94',
      '67879b69360f92251e6819c9',
      '6784fefb360f92251e680065',
      '67879b6c360f92251e6819da',
      '67879402360f92251e6818ac',
      '6784fefd360f92251e680070',
      '67879b6e360f92251e6819df',
      '67879403360f92251e6818b3',
      '67879b70360f92251e6819ef',
      '67879b70360f92251e6819eb',
      '67879b6c360f92251e6819d5',
      '67879b6e360f92251e6819e3',
      '6784dd76360f92251e67ff21',
      '678aac6b360f92251e683e8c',
      '678aac6b360f92251e683e8b',
      '6784fefc360f92251e68006b',
      '6784eb09360f92251e67ff97',
      '67d180f4592fc191c58e18c5',
      '678656b4360f92251e680bd1',
      '678656be360f92251e680bfd',
      '6786570b360f92251e680c12',
      '6786570d360f92251e680c20',
      '678656b7360f92251e680bdc',
      '67865709360f92251e680c08',
      '67865681360f92251e680bc8',
      '6786567c360f92251e680baa',
      '678656b5360f92251e680bd6',
      '6786567d360f92251e680bb0',
      '678656b9360f92251e680be7',
      '6786570f360f92251e680c28',
      '6786567a360f92251e680ba2',
      '68849b17da6c33438d12c18a',
      '6786570b360f92251e680c14',
      '678656bd360f92251e680bf8',
      '6786567a360f92251e680ba3',
      '6787ad24360f92251e681c1b',
      '6786570b360f92251e680c15',
      '678656b9360f92251e680be4',
      '6786567c360f92251e680bab',
      '6786567b360f92251e680ba9',
      '67865680360f92251e680bc0',
      '6786567c360f92251e680bae',
      '67865680360f92251e680bc1',
      '678656bc360f92251e680bf4',
      '67865707360f92251e680c01',
      '6786570e360f92251e680c24',
      '6786567d360f92251e680baf',
      '6786567e360f92251e680bb8',
      '67865681360f92251e680bca',
      '6786567e360f92251e680bb7',
      '6786570a360f92251e680c11',
      '678656ba360f92251e680bec',
      '678656b5360f92251e680bd5',
      '6786570f360f92251e680c29',
      '6786567f360f92251e680bba',
      '67865681360f92251e680bc9',
      '678656be360f92251e680bfb',
      '678656bf360f92251e680bfe',
      '6786567f360f92251e680bbb',
      '678656b6360f92251e680bd7',
      '68ca6f38202745cfe671becc',
      '6786567b360f92251e680ba5',
      '67865708360f92251e680c05',
      '6786567a360f92251e680ba4',
      '6787ad24360f92251e681c1c',
      '678656b4360f92251e680bce',
      '678656b8360f92251e680be3',
      '6786570f360f92251e680c2b',
      '67865681360f92251e680bc7',
      '6786570d360f92251e680c1d',
      '678656b5360f92251e680bd3',
      '67d2adf6592fc191c58e23d7',
      '67d2adf5592fc191c58e23d6',
      '67d17f9a592fc191c58e1837',
      '67d17fac592fc191c58e1874',
      '67d17fb0592fc191c58e1883',
      '6784e463a3ec4445bc1d7a45',
      '67d17fae592fc191c58e187a',
      '67d18407592fc191c58e190c',
      '67d17fa1592fc191c58e1846',
      '67d17fa7592fc191c58e1860',
      '6784e227a3ec4445bc1d704f',
      '6784e102a3ec4445bc1d6c5e',
      '6784d28ea3ec4445bc1d230c',
      '67d18408592fc191c58e1912',
      '6784e6d7a3ec4445bc1d81ab',
      '6784df8fa3ec4445bc1d650f',
      '6784d8cda3ec4445bc1d4097',
      '6784e799a3ec4445bc1d84dd',
      '67861f4da3ec4445bc1eb0b5',
      '6784dbb9a3ec4445bc1d5057',
      '67d1840a592fc191c58e191b',
      '67d2adf1592fc191c58e23c6',
      '6784d3b4a3ec4445bc1d295c',
      '6784debaa3ec4445bc1d6147',
      '6784d66ca3ec4445bc1d33fa',
      '6784d7bda3ec4445bc1d3bd5',
      '67d17fa9592fc191c58e1866',
      '6787ad44360f92251e681c74',
      '6784f1d2a3ec4445bc1db225',
      '6787ad47360f92251e681c85',
      '6787ad43360f92251e681c72',
      '6787ad47360f92251e681c89',
      '6787ad48360f92251e681c8b',
      '6787ad49360f92251e681c90',
      '67862424a3ec4445bc1ec0b0',
      '6787ad44360f92251e681c75',
      '6787ad49360f92251e681c91',
      '6787ad4a360f92251e681c94',
      '6787ad49360f92251e681c92',
      '67d18409592fc191c58e1918',
      '67d17fa1592fc191c58e1849',
      '67d180dd592fc191c58e1899',
      '67d17fb0592fc191c58e1882',
      '678628d8a3ec4445bc1ed262',
      '6787ad49360f92251e681c8f',
      '6787ad42360f92251e681c6b',
      '6784df91a3ec4445bc1d6528',
      '67d180e1592fc191c58e18ac',
      '6784e3a2a3ec4445bc1d76ee',
      '6784ec59a3ec4445bc1d9533',
      '6784e15aa3ec4445bc1d6cde',
      '67d2adf2592fc191c58e23c8',
      '67d180e3592fc191c58e18b8',
      '67850b4da3ec4445bc1e07b9',
      '6784e000a3ec4445bc1d6769',
      '6784ed32360f92251e67ffad',
      '678618f6a3ec4445bc1ea16c',
      '678506d9a3ec4445bc1df8a2',
      '6784dd5ba3ec4445bc1d5980',
      '67d180dc592fc191c58e1894',
      '67d18408592fc191c58e1910',
      '6784efbba3ec4445bc1da785',
      '67d2ad6b592fc191c58e23a4',
      '6784dcbaa3ec4445bc1d5598',
      '6784ee36360f92251e67ffb4',
      '67861b8ea3ec4445bc1ea81e',
      '67d18407592fc191c58e1908',
      '67d17fad592fc191c58e1877',
      '6784da54a3ec4445bc1d48de',
      '6787ad50360f92251e681cba',
      '6784e46ba3ec4445bc1d7a8c',
      '6784d737a3ec4445bc1d37b1',
      '6784e295a3ec4445bc1d72c4',
      '6784e8b4a3ec4445bc1d895e',
      '67d2adeb592fc191c58e23b5',
      '67d2adf2592fc191c58e23ca',
      '6784f133a3ec4445bc1db01c',
      '6784e2d6a3ec4445bc1d7392',
      '67d2adee592fc191c58e23b9',
      '67d18407592fc191c58e190b',
      '6784ea00a3ec4445bc1d8cff',
      '6787ad4a360f92251e681c95',
      '6784ee76a3ec4445bc1d9e73',
      '67d180e1592fc191c58e18ab',
      '678615bba3ec4445bc1e995a',
      '6784ef68a3ec4445bc1da4fe',
      '67d2ad6b592fc191c58e23a2',
      '67d180df592fc191c58e18a4',
      '6787ad4e360f92251e681cad',
      '6787ad4f360f92251e681cb2',
      '6787ad4e360f92251e681caf',
      '6787ad4e360f92251e681cac',
      '6787ad4e360f92251e681caa',
      '6787ad4f360f92251e681cb0',
      '678793fb360f92251e68188b',
      '6787ad42360f92251e681c6d',
      '6784ff00360f92251e68007a',
      '67d18a30592fc191c58e1959',
      '678f6335360f92251e6854c3',
      '678f6335360f92251e6854c4',
      '6790aea4360f92251e685f77',
      '678f59f0360f92251e685497',
      '678f59f0360f92251e685496',
      '678e202d360f92251e684b2a',
      '678e202d360f92251e684b29',
      '678e2042360f92251e684b31',
      '678e5c3a360f92251e684fab',
      '678fa66e360f92251e685928',
      '678e335b360f92251e684c92',
      '678e335b360f92251e684c90',
      '678e335d360f92251e684c9a',
      '678e335d360f92251e684c98',
      '678e2c81360f92251e684c01',
      '678e335b360f92251e684c91',
      '678f59ee360f92251e68548c',
      '678f59ef360f92251e68548e',
      '678f59ed360f92251e685482',
      '678f59eb360f92251e68547a',
      '678f59ef360f92251e685491',
      '678f59eb360f92251e685479',
      '6790af9d360f92251e685fa0',
      '678f59ea360f92251e685473',
      '678e5c3a360f92251e684fae',
      '678f59eb360f92251e685478',
      '678e5c3a360f92251e684faa',
      '678e5c39360f92251e684fa6',
      '67d2d003592fc191c58e257e',
      '678e4357360f92251e684e27',
      '678f59eb360f92251e68547c',
      '678f59ec360f92251e685481',
      '67864b41a3ec4445bc1f5e2b',
      '678f58f2360f92251e68544f',
      '678e0830360f92251e6849f3',
      '678f66cf360f92251e6854e3',
      '678f66cf360f92251e6854df',
      '678e2c7e360f92251e684bf3',
      '678e5c3a360f92251e684fad',
      '678e335b360f92251e684c93',
      '678f59f0360f92251e685492',
      '6790af9d360f92251e685f9d',
      '678e3987360f92251e684cfa',
      '67d2d004592fc191c58e2583',
      '67d2d004592fc191c58e2584',
      '67d2d016592fc191c58e25b0',
      '6787b2d2360f92251e681d35',
      '6787b2d1360f92251e681d2b',
      '678f66d0360f92251e6854e8',
      '6787b2d1360f92251e681d2d',
      '6787b2d4360f92251e681d3c',
      '6787abb4360f92251e681bf1',
      '6787b2d6360f92251e681d4b',
      '6787b2d8360f92251e681d52',
      '6788fc7f360f92251e682ae8',
      '6787abac360f92251e681bc5',
      '6787ad35360f92251e681c67',
      '6787abae360f92251e681bce',
      '6787abad360f92251e681bca',
      '6787abac360f92251e681bc7',
      '67dd41c183b72f1afe58029d',
      '6787b2d3360f92251e681d38',
      '6787ad34360f92251e681c61',
      '6787ad34360f92251e681c62',
      '6787abb5360f92251e681bf5',
      '6787b2d4360f92251e681d41',
      '6788fc80360f92251e682ae9',
      '67dd53d183b72f1afe580394',
      '67dd41b783b72f1afe580289',
      '67dd53d483b72f1afe5803a2',
      '6789ee73360f92251e68351f',
      '6789ee74360f92251e683521',
      '6790dc48360f92251e686188',
      '6790dc43360f92251e686174',
      '6790dc44360f92251e686177',
      '6790dc43360f92251e686172',
      '6790dc45360f92251e68617a',
      '6790dc47360f92251e686184',
      '6790dc46360f92251e686181',
      '6790dc4a360f92251e686195',
      '6790dc4b360f92251e686197',
      '6790dc48360f92251e68618a',
      '6790dc46360f92251e68617e',
      '6790dc49360f92251e686190',
      '6790dc48360f92251e68618b',
      '6790dc47360f92251e686186',
      '6790dc46360f92251e686180',
      '6789ee74360f92251e683523',
      '6787b2d6360f92251e681d49',
      '6788fc7f360f92251e682ae4',
      '6784f879360f92251e680032',
      '6784f87a360f92251e680036',
      '6784f87a360f92251e680035',
      '6787ad54360f92251e681cc6',
      '6787ad53360f92251e681cc5',
      '6787a797360f92251e681bb3',
      '6787a796360f92251e681baf',
      '6787ad52360f92251e681cc4',
      '6784f87a360f92251e680033',
      '6784f87a360f92251e680034',
      '678a2512360f92251e68369f',
      '6784f87a360f92251e680037',
      '67850854360f92251e680129',
      '6787a796360f92251e681bad',
      '6787a796360f92251e681bb1',
      '6784f87b360f92251e680039',
      '6790dc45360f92251e68617c',
      '6790dc45360f92251e68617d',
      '67850855360f92251e68012c',
      '67850855360f92251e68012b',
      '67879b95360f92251e6819fb',
      '6787a794360f92251e681ba2',
      '6787a794360f92251e681ba6',
      '6787a18f360f92251e681ab6',
      '6790dc48360f92251e686187',
      '6790dc4a360f92251e686192',
      '6790dc4b360f92251e686196',
      '6790dc49360f92251e68618c',
      '6790dc44360f92251e686176',
      '67878fda360f92251e6817f3',
      '6788d457360f92251e682732',
      '6788cff5360f92251e6826f4',
      '6790af9a360f92251e685f91',
      '67d2d016592fc191c58e25af',
      '67878fdc360f92251e6817fb',
      '6790dc48360f92251e686189',
      '6790dc49360f92251e68618f',
      '6790dc43360f92251e686170',
      '6790dc47360f92251e686185',
      '6790dc44360f92251e686178',
      '6790dc4c360f92251e68619a',
      '67850856360f92251e68012f',
      '67878fdb360f92251e6817f5',
      '678e1889360f92251e684a83',
      '67d2d017592fc191c58e25b3',
      '67d2d018592fc191c58e25c1',
      '67d42c0ce502ef88bcf64170',
      '67d2d017592fc191c58e25bc',
      '67d2d005592fc191c58e2588',
      '67d2d006592fc191c58e258d',
      '67d2d005592fc191c58e2589',
      '67d2d006592fc191c58e258c',
      '67d2d018592fc191c58e25c3',
      '67d2d019592fc191c58e25c7',
      '67d55d10e502ef88bcf64854',
      '67d55d10e502ef88bcf64855',
      '67d55d11e502ef88bcf64857',
      '678e1889360f92251e684a81',
      '67d2d005592fc191c58e258a',
      '67d2d017592fc191c58e25b9',
      '6790af96360f92251e685f7e',
      '67d2d018592fc191c58e25bf',
      '67d2d005592fc191c58e258b',
      '67d55d11e502ef88bcf64859',
      '67d4028ce502ef88bcf63e81',
      '6790af99360f92251e685f90',
      '67cecffb592fc191c58e0371',
      '67ced619592fc191c58e0421',
      '67ced0ca592fc191c58e03d5',
      '67cee843592fc191c58e04ec',
      '67cecffa592fc191c58e036c',
      '67cecffd592fc191c58e037d',
      '67ced0c9592fc191c58e03d0',
      '67cee846592fc191c58e04f3',
      '67cee84c592fc191c58e04fa',
      '67878fda360f92251e6817f1',
      '67878fdf360f92251e681807',
      '67878fda360f92251e6817f0',
      '67878fd9360f92251e6817ed',
      '6787ad28360f92251e681c21',
      '67d2d004592fc191c58e2586',
      '67d2d005592fc191c58e2587',
      '67d2d017592fc191c58e25b8',
      '6790af98360f92251e685f8a',
      '67ced454592fc191c58e0403',
      '67cee845592fc191c58e04ef',
      '67cee84a592fc191c58e04f7',
      '67ced0c7592fc191c58e03c8',
      '67cee849592fc191c58e04f6',
      '67cecffb592fc191c58e0374',
      '67cecffb592fc191c58e0372',
      '67cee84b592fc191c58e04f9',
      '67cecfff592fc191c58e0388',
      '67ced024592fc191c58e039e',
      '67ced020592fc191c58e038d',
      '67ced024592fc191c58e03a1',
      '67ced0c5592fc191c58e03bc',
      '67ced0c7592fc191c58e03c5',
      '67cecffc592fc191c58e0375',
      '67ced616592fc191c58e0415',
      '67ced617592fc191c58e0418',
      '67cee84a592fc191c58e04f8',
      '67cecffa592fc191c58e036d',
      '67ced024592fc191c58e03a0',
      '67ced0c4592fc191c58e03b9',
      '67ced0c6592fc191c58e03c0',
      '67ced0c6592fc191c58e03c1',
      '67ced0c8592fc191c58e03cb',
      '67ced0c8592fc191c58e03cc',
      '67ced0ca592fc191c58e03d8',
      '67ced615592fc191c58e0413',
      '67ced619592fc191c58e0422',
      '67cee36f592fc191c58e04be',
      '67cee847592fc191c58e04f4',
      '67cecffe592fc191c58e0380',
      '67ced025592fc191c58e03a5',
      '67ced0ca592fc191c58e03d6',
    ],
  },
}, {
  $set: {
    verificationStatus: true
  }
}) 

console.log(resp)

  } catch (err) {
    console.error('An error occured connecting to the DB')
    console.error(err)
  }
}
startDB()
