import { useState, useContext } from 'react'
import { ProSidebar, Menu, MenuItem } from 'react-pro-sidebar'
import { Box, IconButton, Typography, useTheme, Switch } from '@mui/material'
import { Link } from 'react-router-dom'
import 'react-pro-sidebar/dist/css/styles.css'
import { tokens } from '../../theme'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined'
import DescriptionIcon from '@mui/icons-material/Description' // Sheet icon
import ContactsOutlinedIcon from '@mui/icons-material/ContactsOutlined'
import SchoolIcon from '@mui/icons-material/School'
// import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import PaymentIcon from '@mui/icons-material/Payment'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined'
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined'
import PieChartOutlineOutlinedIcon from '@mui/icons-material/PieChartOutlineOutlined'
import TimelineOutlinedIcon from '@mui/icons-material/TimelineOutlined'
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined'
import { ChangePasswordForm } from '../../components/changePasswordPopup.jsx'
import VisibilityIcon from '@mui/icons-material/Visibility'
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks'
import { ExportSubmitButton } from '../../components/exportButton.jsx'
import ImportContactsIcon from '@mui/icons-material/ImportContacts' // For import
import FileUploadIcon from '@mui/icons-material/FileUpload' // For export
import AutorenewIcon from '@mui/icons-material/Autorenew'

import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye'
import MenuIcon from '@mui/icons-material/Menu' // Horizontal bars icon
import CloseIcon from '@mui/icons-material/Close' // Cancel icon
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import EventNoteIcon from '@mui/icons-material/EventNote'
import CheckIcon from '@mui/icons-material/Check'
import EditIcon from '@mui/icons-material/Edit'
import NoteAddIcon from '@mui/icons-material/NoteAdd'
import PrintIcon from '@mui/icons-material/Print'

import { useAuth } from '../auth/authContext.jsx'
import {
  ArrowBack,
  ArrowDropDownCircleRounded,
  Visibility,
} from '@mui/icons-material'
const Item = ({ title, to, icon, selected, setSelected }) => {
  const theme = useTheme()
  const colors = tokens(theme.palette.mode)

  const label = { inputProps: { 'aria-label': 'Switch demo' } }

  return (
    <MenuItem
      active={selected === title}
      style={{
        color: colors.grey[100],
      }}
      onClick={() => setSelected(title)}
      icon={icon}
    >
      <Typography>{title}</Typography>
      <Link to={to} />
    </MenuItem>
  )
}

const Sidebar = ({ isSidebar }) => {
  const { userPermissions } = useAuth()
  const theme = useTheme()
  const colors = tokens(theme.palette.mode)
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [selected, setSelected] = useState('Dashboard')
  const storedUser = JSON.parse(localStorage.getItem('userData'))
  const label = { inputProps: { 'aria-label': 'Switch demo' } }
  const [open, setOpen] = useState(false)

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  return (
    <Box
      className={`no-print sidebark ${isSidebar ? '' : 'collapsed'}`}
      sx={{
        '& .pro-sidebar-inner': {
          background: `${colors.primary[400]} !important`,
        },
        '& .pro-icon-wrapper': {
          backgroundColor: 'transparent !important',
        },
        '& .pro-inner-item': {
          padding: '5px 35px 5px 20px !important',
        },
        '& .pro-inner-item:hover': {
          color: `${colors.main['darkGreen']} !important`,
        },
        '& .pro-menu-item.active': {
          color: `${colors.main['darkGreen']} !important `,
        },
      }}
    >
      <ProSidebar
        collapsed={isCollapsed}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          maxWidth: '200px !important',
        }}
      >
        <Menu
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* LOGO AND MENU ICON */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconButton
              onClick={() => setIsCollapsed(!isCollapsed)}
              sx={{
                color: '#196b57', // Icon color
                '&:hover': {
                  backgroundColor: '#196b57', // Background color on hover
                  color: '#fff',
                },
              }}
            >
              {isCollapsed ? <MenuIcon /> : <CloseIcon />}
            </IconButton>
          </Box>

          {!isCollapsed && (
            <Box
              display="none"
              justifyContent="space-between"
              alignItems="center"
              ml="15px"
            ></Box>
          )}

          {!isCollapsed && (
            <Box mb="25px">
              <Box display="flex" justifyContent="center" alignItems="center">
                <img
                  alt="profile-user"
                  width="100px"
                  height="100px"
                  src={userPermissions.length > 0 && storedUser.passport_url}
                  style={{ cursor: 'pointer', borderRadius: '50%' }}
                />
              </Box>
              <Box textAlign="center">
                <Box sx={{ marginTop: '20px', marginBottom: '20px' }}>
                  <ChangePasswordForm
                    open={open}
                    handleOpen={handleOpen}
                    handleClose={handleClose}
                  />
                </Box>
                <Typography
                  variant="h6"
                  color={colors.grey[100]}
                  fontWeight="bold"
                  sx={{ m: '10px 0 0 0' }}
                >
                  Email: {userPermissions.length > 0 && storedUser.email}
                </Typography>
                <Typography
                  variant="h6"
                  color={colors.grey[100]}
                  fontWeight="bold"
                  sx={{ m: '10px 0 0 0' }}
                >
                  user ID:{' '}
                  {userPermissions.length > 0
                    ? storedUser?.randomId
                    : 'no random id'}
                </Typography>
              </Box>
            </Box>
          )}

          <Box paddingLeft={isCollapsed ? undefined : '10%'} marginTop={5}>
            {/* <Item
              title="Dashboard"
              to={
                userPermissions.includes('handle_registrars')
                  ? '/admin-dashboard'
                  : '/enumerator-dashboard'
              }
              icon={<HomeOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            /> */}

            {/* {userPermissions.includes('handle_registrars') && <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              
            </Typography>} */}
            {/* {!userPermissions.includes('handle_payments') ||
            (userPermissions.includes('handle_students') &&
              userPermissions.includes('handle_admins') &&
              userPermissions.includes('handle_verifications')) ? (
              <Item
                title="Register Account"
                to={
                  userPermissions.includes('handle_registrars')
                    ? '/admin-dashboard/role-selector'
                    : // : '/enumerator-dashboard/create-student-school-selector'
                      '/enumerator-dashboard'
                }
                icon={<PeopleOutlinedIcon />}
                selected={selected}
                setSelected={setSelected}
              />
            ) : null}

            {!userPermissions.includes('handle_payments') &&
              !(
                userPermissions.includes('handle_students') &&
                userPermissions.length === 2
              ) &&
              !userPermissions.length === 1 && (
                <Item
                  title="Register Account"
                  to={
                    userPermissions.includes('handle_registrars')
                      ? '/admin-dashboard/role-selector'
                      : '/enumerator-dashboard/create-student-preselect'
                  }
                  icon={<PeopleOutlinedIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />
              )}

            <Item
              title="Manage Students"
              to={
                userPermissions.includes('handle_registrars')
                  ? 'admin-dashboard/view-all-students-data'
                  : userPermissions.includes('handle_students') &&
                    userPermissions.length < 2
                  ? 'enumerator-dashboard/view-all-students-data'
                  : '/payroll-specialist-dashboard/view-students'
              }
              icon={<ContactsOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            /> */}

            {/**********************************  Super Admin Sidebar ******************************** */}

            {userPermissions.includes('handle_admins') && (
              <>
                <Item
                  title="Dashboard"
                  to={'/admin-dashboard'}
                  icon={<HomeOutlinedIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />
                <Item
                  title="Register Account"
                  to={'/admin-dashboard/role-selector'}
                  icon={<PeopleOutlinedIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />
                <Item
                  title="Manage Students"
                  to={'/admin-dashboard/view-all-students-data'}
                  icon={<ContactsOutlinedIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />
                <Item
                  title="View all Students"
                  to={'/admin-dashboard/admin-view-all-students-no-export'}
                  icon={<VisibilityIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />

                <Item
                  title="Manage Duplicate Students Record"
                  to={
                    '/admin-dashboard/manage-accounts/manage-duplicate-records'
                  }
                  icon={<ContentCopyIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />

                <Item
                  title="View Attendance Record"
                  to={
                    userPermissions.includes('handle_registrars')
                      ? '/admin-dashboard/admin-view-attendance'
                      : 'enumerator-dashboard/view-all-students-data'
                  }
                  icon={<LibraryBooksIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />
                <Item
                  title="Update Bank Record"
                  to={'/admin-dashboard/update-bank-record'}
                  icon={<AutorenewIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />
                <Item
                  title="View Payments Record"
                  to={
                    userPermissions.includes('handle_registrars')
                      ? '/admin-dashboard/admin-view-payments'
                      : 'enumerator-dashboard/view-all-students-data'
                  }
                  icon={<AttachMoneyIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />
                {/* <Item
                  title="View Attendance"
                  to={userPermissions.includes('handle_registrars') ? '/admin-dashboard/admin-view-attendance' : 'enumerator-dashboard/view-all-students-data'}
                  icon={<EventNoteIcon />}
                  selected={selected}
                  setSelected={setSelected}
                /> */}
                <Item
                  title="Exp. Attendance Sheet"
                  to={
                    userPermissions.includes('handle_registrars')
                      ? '/admin-dashboard/admin-export-attendance-sheet'
                      : 'enumerator-dashboard/view-all-students-data'
                  }
                  icon={<EventNoteIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />

                <Item
                  title="Exp. Attendance record"
                  to={
                    userPermissions.includes('handle_registrars')
                      ? '/admin-dashboard/update-attendance-sheet'
                      : 'enumerator-dashboard/view-all-students-data'
                  }
                  icon={<NoteAddIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />

                <Item
                  title="Manage Admins"
                  to={
                    userPermissions.includes('handle_registrars')
                      ? 'admin-dashboard/manage-accounts/admins'
                      : 'enumerator-dashboard/view-all-students-data'
                  }
                  icon={<AdminPanelSettingsIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />

                <>
                  <Item
                    title="Manage Enumerators"
                    to={
                      userPermissions.includes('handle_registrars')
                        ? 'admin-dashboard/manage-accounts/enumerators'
                        : 'enumerator-dashboard/view-all-students-data'
                    }
                    icon={<FormatListNumberedIcon />}
                    selected={selected}
                    setSelected={setSelected}
                  />
                  <Item
                    title="Manage Payroll Specialists"
                    to={
                      userPermissions.includes('handle_registrars')
                        ? 'admin-dashboard/manage-accounts/payroll-specialists'
                        : 'enumerator-dashboard/view-all-students-data'
                    }
                    icon={<PaymentIcon />}
                    selected={selected}
                    setSelected={setSelected}
                  />

                  <Item
                    title="Manage School"
                    to={
                      userPermissions.includes('handle_registrars')
                        ? 'admin-dashboard/manage-accounts/schools'
                        : 'enumerator-dashboard/view-all-students-data'
                    }
                    icon={<SchoolIcon />}
                    selected={selected}
                    setSelected={setSelected}
                  />

                  <Item
                    title="Print Id Cards"
                    to={
                      userPermissions.includes('handle_registrars')
                        ? 'admin-dashboard/idcards/print'
                        : 'enumerator-dashboard/view-all-students-data'
                    }
                    icon={<PrintIcon />}
                    selected={selected}
                    setSelected={setSelected}
                  />
                </>
              </>
            )}

            {/**********************************   Admin Sidebar ******************************** */}

            {userPermissions.includes('handle_registrars') &&
              userPermissions.length === 2 && (
                <>
                  <Item
                    title="View all Students"
                    to={
                      userPermissions.includes('handle_registrars')
                        ? '/admin-dashboard/admin-view-all-students-no-export'
                        : 'enumerator-dashboard/view-all-students-data'
                    }
                    icon={<VisibilityIcon />}
                    selected={selected}
                    setSelected={setSelected}
                  />

                  {/* <Item
                  title="View Payments Record"
                  to={userPermissions.includes('handle_registrars') ? '/admin-dashboard/admin-view-payments' : 'enumerator-dashboard/view-all-students-data'}
                  icon={<AttachMoneyIcon />}
                  selected={selected}
                  setSelected={setSelected}
                /> */}
                  {/* <Item
                  title="View Attendance"
                  to={userPermissions.includes('handle_registrars') ? '/admin-dashboard/admin-view-attendance' : 'enumerator-dashboard/view-all-students-data'}
                  icon={<EventNoteIcon />}
                  selected={selected}
                  setSelected={setSelected}
                /> */}
                  {/* <Item
                  title="Export Attendance"
                  to={userPermissions.includes('handle_registrars') ? '/admin-dashboard/admin-export-attendance' : 'enumerator-dashboard/view-all-students-data'}
                  icon={<EventNoteIcon />}
                  selected={selected}
                  setSelected={setSelected}
                /> */}

                  {/* new routes start here */}

                  <Item
                    title="View Attendance Record"
                    to={
                      userPermissions.includes('handle_registrars')
                        ? '/admin-dashboard/admin-view-attendance'
                        : 'enumerator-dashboard/view-all-students-data'
                    }
                    icon={<LibraryBooksIcon />}
                    selected={selected}
                    setSelected={setSelected}
                  />
                  <Item
                    title="Update Bank Record"
                    to={'/admin-dashboard/update-bank-record'}
                    icon={<AutorenewIcon />}
                    selected={selected}
                    setSelected={setSelected}
                  />
                  <Item
                    title="View Payments Record"
                    to={
                      userPermissions.includes('handle_registrars')
                        ? '/admin-dashboard/admin-view-payments'
                        : 'enumerator-dashboard/view-all-students-data'
                    }
                    icon={<AttachMoneyIcon />}
                    selected={selected}
                    setSelected={setSelected}
                  />

                  <Item
                    title="Manage Duplicate Students Record"
                    to={
                      userPermissions.includes('handle_registrars')
                        ? '/admin-dashboard/manage-accounts/manage-duplicate-records'
                        : 'enumerator-dashboard/view-all-students-data'
                    }
                    icon={<ContentCopyIcon />}
                    selected={selected}
                    setSelected={setSelected}
                  />

                  <Item
                    title="Exp. Attendance Sheet"
                    to={
                      userPermissions.includes('handle_registrars')
                        ? '/admin-dashboard/admin-export-attendance-sheet'
                        : 'enumerator-dashboard/view-all-students-data'
                    }
                    icon={<EventNoteIcon />}
                    selected={selected}
                    setSelected={setSelected}
                  />

                  <Item
                    title="Exp. Attendance record"
                    to={
                      userPermissions.includes('handle_registrars')
                        ? '/admin-dashboard/update-attendance-sheet'
                        : 'enumerator-dashboard/view-all-students-data'
                    }
                    icon={<NoteAddIcon />}
                    selected={selected}
                    setSelected={setSelected}
                  />
                  <Item
                    title="Manage Enumerators"
                    to={
                      userPermissions.includes('handle_registrars')
                        ? 'admin-dashboard/manage-accounts/enumerators'
                        : 'enumerator-dashboard/view-all-students-data'
                    }
                    icon={<FormatListNumberedIcon />}
                    selected={selected}
                    setSelected={setSelected}
                  />

                  <Item
                    title="Print Id Cards"
                    to={
                      userPermissions.includes('handle_registrars')
                        ? 'admin-dashboard/idcards/print'
                        : 'enumerator-dashboard/view-all-students-data'
                    }
                    icon={<PrintIcon />}
                    selected={selected}
                    setSelected={setSelected}
                  />

                  <></>
                </>
              )}

            {/**********************************  Enumerator sidebar ******************************** */}

            {userPermissions.length === 1 && (
              <>
                <Item
                  title="Dashboard"
                  to={'/enumerator-dashboard'}
                  icon={<HomeOutlinedIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />
                <Item
                  title="Register Account"
                  to={
                    userPermissions.includes('handle_registrars')
                      ? '/admin-dashboard/role-selector'
                      : // : '/enumerator-dashboard/create-student-school-selector'
                        '/enumerator-dashboard'
                  }
                  icon={<PeopleOutlinedIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />
                <Item
                  title="Export Attendance Sheet"
                  to={'/export-attendance-sheet'}
                  icon={<DescriptionIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />

                <Item
                  title="Import Attendance Sheet"
                  to={'/import-attendance-sheet'}
                  icon={<FileUploadIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />

                <Item
                  title="View Attendance"
                  to={'/view-attendance-sheet'}
                  icon={<RemoveRedEyeIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />
              </>
            )}

            {/**********************************  Payroll Speciast sidebar ******************************** */}

            {userPermissions.length === 2 &&
              userPermissions.includes('handle_payments') && (
                <>
                  <Item
                    title="Dashboard"
                    to={'/payroll-specialist-dashboard'}
                    icon={<HomeOutlinedIcon />}
                    selected={selected}
                    setSelected={setSelected}
                  />
                  <Item
                    title="Export Attendance"
                    to={'/export-attendance-sheet'}
                    icon={<DescriptionIcon />}
                    selected={selected}
                    setSelected={setSelected}
                  />
                  <Item
                    title="Export Attendance"
                    to={'/payroll-specialist-dashboard/update-attendance-sheet'}
                    icon={<DescriptionIcon />}
                    selected={selected}
                    setSelected={setSelected}
                  />

                  <Item
                    title="Upload Payments Records"
                    to={'/payroll-specialist-dashboard/upload-payment'}
                    icon={<FileUploadIcon />}
                    selected={selected}
                    setSelected={setSelected}
                  />
                  <Item
                    title="Update Bank Record"
                    to={'/payroll-specialist-dashboard/update-bank-record'}
                    icon={<AutorenewIcon />}
                    selected={selected}
                    setSelected={setSelected}
                  />
                  <Item
                    title="View Payments"
                    to={'/payroll-specialist-dashboard/view-payments-records'}
                    icon={<VisibilityIcon />}
                    selected={selected}
                    setSelected={setSelected}
                  />
                </>
              )}

            {userPermissions.includes('handle_verifications') && (
              <>
                <Item
                  title="Dashboard"
                  to={'/verifier-dashboard'}
                  icon={<HomeOutlinedIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />
                <Item
                  title="Verify Students"
                  to={'/verifier-dashboard/preselect-info'}
                  icon={<CheckIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />
              </>
            )}
          </Box>
        </Menu>
      </ProSidebar>
    </Box>
  )
}

export default Sidebar
