import { FormComponent } from '../../components/FormComponent.jsx'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'

// Inside your component
export const EditManyStudents = () => {
  const API_URL = `${import.meta.env.VITE_API_URL}/api/v1`
  const navigate = useNavigate()
  const location = useLocation()
  const { selectedStudents } = location.state || {}
  console.log(selectedStudents)

  const ids = selectedStudents.map(
    (selectedStudents) => selectedStudents.randomId
  )

  console.log(ids)
  // const ids = selectedStudents.join(',');
  const joinedIds = ids.join(',')
  // const handleEditManyStudents = async (e) => {
  //   e.preventDefault();
  //   try {
  //     // const confirmDelete = window.confirm(`Are you sure you want to delete ${selectedStudents.length} students `)
  //     // if (!confirmDelete) return;
  //     // setDeleteLoading(true)

  //     const token = localStorage.getItem('token') || '';
  //     console.log(token)

  //     const ids = selectedStudents.map(
  //       (selectedStudents) => selectedStudents.randomId
  //     )
  //     // const ids = selectedStudents.join(',');
  //     const joinedIds = ids.join(',');
  //     console.log('joinedIds')

  //     await axios.patch(
  //       `${API_URL}/student/update/edit-students-details/?ids=${joinedIds}`,
  //       {},
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //           'Content-Type': 'application/json',
  //         },
  //         withCredentials: true,
  //       }
  //     )

  //     // setSelectedStudents([])
  //   } catch (err) {
  //     console.log(err)
  //     // if (err.response?.statusText === '"Unauthorized"' || err?.status === 401)
  //     //   return navigate('/')
  //     // alert(
  //     //   err.response?.message ||
  //     //     err.response?.data?.message ||
  //     //     err?.message ||
  //     //     'an error occured, please try again'
  //     // )
  //   }
  // }
  return (
    <FormComponent
      formTitle="Bulk Edit Students"
      allowWard={false}
      allowSchoolId={true}
      allowSurname={false}
      allowFirstname={false}
      allowMiddlename={false}
      allowStudentNin={false}
      allowDob={false}
      allowStateOfOrigin={false}
      allowLga={false}
      allowLgaOfEnrollment={false}
      allowGender={false}
      allowCommunityName={false}
      allowResidentialAddress={false}
      allowPresentClass={true}
      allowYearAdmitted={false}
      allowYearOfEnrollment={false}
      allowParentPhone={false}
      allowParentName={false}
      allowParentNin={false}
      allowNationality={false}
      allowParentContact={false}
      allowParentOccupation={false}
      allowBankName={false}
      allowAccountNumber={false}
      allowParentBvn={false}
      allowDisabilitystatus={false}
      allowImage={false}
      allowSchoolCategory={false}
      reqBody={{}}
      reqUrl={`${API_URL}/student/update/edit-students-details/?ids=${joinedIds}`}
      reqType={'patch'}
      submitButtonText={'Update Students'}
    />
  )
}
