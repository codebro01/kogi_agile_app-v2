import  adminAuthRouter  from "./auth/adminAuth.js";
import registrarAuthRouter from './auth/registrarAuth.js'
import payrollSpecialistRouter from './payrollSpecialistRouter.js'
import studentsRouter from './studentsRouter.js'
import allSchoolsRouter from './getSchoolsRouter.js'
import wards from './getAllWardsRouter.js'
import paymentRouter from './paymentRouter.js';
import schoolsRouter from './schoolsRouter.js';
import attendanceRouter from './attendanceRouter.js';
import verifierRouter from './verifierRouter.js'

export {
  schoolsRouter,
  adminAuthRouter,
  registrarAuthRouter,
  studentsRouter,
  allSchoolsRouter,
  wards,
  payrollSpecialistRouter,
  paymentRouter,
  attendanceRouter,
  verifierRouter,
}