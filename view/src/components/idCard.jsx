import { Card, CardContent, Typography, Avatar, Box } from "@mui/material";
import { QRCodeCanvas } from "qrcode.react";


export const StudentIDFront = ({ student }) => {
  console.log(student)
    return (
      <Card
        className="id-front"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          width: '340px',
          height: '230px',
          //   borderRadius: 3,
          textAlign: 'center',
          p: 1,
          paddingTop: '40px',

          boxShadow: 3,
          position: 'relative',
          //   backgroundColor: 'hsl(160deg 31.03% 94.31%)',

          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: `url("/site-logo-dark-no-writeup.png")`,
            backgroundSize: '35%',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            opacity: 0.3, // ✅ Reduce opacity to make the background faint
          },

          '@media Print': {
            width: '450px',
            height: '280px',
            breakInside: 'avoid',
            pageBreakInside: 'avoid',
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            padding: 0,
            margin: 0,
            width: '250px',
            marginBottom: '15px',
            gap: '5px',
            '@media Print': {
              width: '250px',
              marginBottom: '9px',
            },
          }}
        >
          <Avatar
            src={'/site-logo-dark-no-writeup.png'}
            alt="Student"
            sx={{
              width: 50,
              height: 50,
              margin: '0 auto',
              alignSelf: 'center',
              '@media Print': {
                width: 70,
                height: 70,
              },
            }}
          />
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
              gap: 0,

              '& > h1': {
                fontSize: '2rem',
                fontWeight: 700,
                color: '#40ac5b',
                lineHeight: 1,

                '@media Print': {
                  fontSize: '2rem',
                },
              },
              '& > h5,': {
                fontSize: '10px',
                fontWeight: 500,
                color: '#000',
                lineHeight: 1,
                marginLeft: '3px',

                '@media Print': {
                  fontSize: '10px',
                },
              },
            }}
          >
            <Typography
              variant="h1"
              sx={{
                color: '#40ac5b',
                fontSize: '1.3rem',
              }}
            >
              KOGI AGILE
            </Typography>
            <Typography
              variant="h5"
              sx={{
                textAlign: 'left',
              }}
            >
              Kogi State Adolescent Girls Initiative for Learning and
              Empowerment
            </Typography>
            {/* <Typography variant="h1">KOGI AGILE</Typography> */}
          </Box>
        </Box>

        <CardContent
          sx={{
            display: 'flex',
            padding: '0 8px',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'flex-start',
              paddingTop: 0,
              flexBasis: '80%',
              '& > .rows-info': {
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                gap: '5px',
                width: '100%',
              },
              '& > .rows-info > .MuiTypography-body1 ': {
                fontSize: '12px',
                alignSelf: 'flex-start',
                justifySelf: 'flex-start',
                textAlign: 'left',
                lineHeight: 1,
                '@media Print': {
                  fontSize: '14px',
                },
              },
              '& > .rows-info > .MuiTypography-body1:first-child': {
                flexBasis: '60%',
                alignSelf: 'flex-start',
              },
              '& > .rows-info > .MuiTypography-body1:second-child': {
                flexBasis: '30%',
              },

              '& > .MuiTypography-body1 ': {
                fontSize: '12px',
                fontWeight: 800,
                textAlign: 'left',
                '@media Print': {
                  fontSize: '14px',
                  textAlign: 'left',
                },
              },
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: 'red !important',
                fontWeight: '700',
                marginLeft: '53px',
                position: 'absolute',
                top: '65px',
                '@media Print': {
                  marginLeft: '74px',
                  position: 'absolute',
                  top: '85px',
                },
              }}
            >
              CCT ID CARD
            </Typography>
            <Box className="rows-info">
              <Typography variant="body1">
                <strong>Student's ID: {student.randomId}</strong>
              </Typography>
              <Typography variant="body1">
                <strong>
                  Class:{' '}
                  {student.presentClass === 'Primary 6'
                    ? 'Pry 6'
                    : student.presentClass}
                </strong>
              </Typography>
            </Box>
            <Typography variant="body1">
              <strong>
                Name:{student.surname} {student.firstname}
              </strong>
            </Typography>
            <Box className="rows-info">
              <Typography variant="body1" >
                <strong>Date of Birth: {student.dob.split('T')[0]}</strong>
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ textAlign: 'left', lineHeight: 0.9, mt: '5px'}}>
              School: {student.schoolId.schoolName}
            </Typography>

            <Typography variant="body1">
              Caregiver's Name: {student.parentName}
            </Typography>
            <Typography variant="body1">
              Caregiver's Phone: 0{student.parentPhone}
            </Typography>
            <Typography variant="body1">
              <strong>Cohort: First</strong>
            </Typography>
            {/* <Typography
              variant="body1"
              sx={{
                color: 'white',
                background: 'red',
                width: '100%',
                fontSize: '11px',
                fontWeight: 800,
                position: 'absolute',
                bottom: 0,
                left: 0,
                textAlign: 'center !important',
              }}
            >
              Conditional Cash Transfer
            </Typography> */}
          </Box>
          <Box
            component = 'img'
            className="passportOnId"
            src={student.passport}
            alt="Student"
            sx={{
              flexBasis: '20%',
              width: '70px',
              height: '80px',
              margin: '0 auto',
              alignSelf: 'flex-end',
              position: 'absolute',
              top: '50px',
              right: '15px',
              '@media Print': {
                top: '70px',
                width: '70px',
                height: '80px',
                borderRadius: 0
              },
            }}
          />
          <Box
            sx={{
              flexBasis: '20%',
              width: '70px',
              height: '80px',
              margin: '0 auto',
              alignSelf: 'flex-end',
              position: 'absolute',
              top: 0,
              bottom: '10px',
              right: '15px',
              borderRadius: '5px',

              '@media Print': {
                bottom: '25px',
              },
            }}
          >
            <QRCodeCanvas
              value={`${student.surname} - ${student.firstname} - ${student.randomId}`}
              size={70}
            />
          </Box>
        </CardContent>
      </Card>
    )
};


export const StudentIDBack = ({ student }) => {
    return (
      <Card
        sx={{
          width: '340px',
          height: '230px',
          //   borderRadius: 3,
          textAlign: 'center',
          p: 1,
          boxShadow: 3,
          position: 'relative',

          '@media Print': {
            width: '450px',
            height: '280px',
          },
        }}
      >
        <CardContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '5px',

            '@media Print': {
              gap: '7px',
            },
          }}
        >
          <Typography
            fontSize={8}
            sx={{
              '@media Print': {
                fontSize: '10px',
              },
            }}
            variant="body2"
          >
            <strong>
              The bearer whose name and photograph appear overleaf is a student
              under the{' '}
            </strong>
          </Typography>
          <Typography
            variant="body2"
            sx={{
              textTransform: 'uppercase',
              lineHeight: 0.9,
              '@media Print': {
                fontSize: '14px',
              },
            }}
          >
            <strong>
              Kogi State Government <br /> Ministry of Education
            </strong>{' '}
          </Typography>

          <Box
            sx={{
              display: 'flex',
              gap: '50px',
              justifyContent: 'center',
            }}
          >
            <img
              src="/portal-landing-logo.png"
              alt="kogi-agile x world bank img"
              style={{
                width: '100px',
              }}
            />
          </Box>

          <Typography
            variant="body2"
            fontSize={10}
        
            sx={{
                lineHeight: 0.9, 
              '@media Print': {
                fontSize: '14px',
              },
            }}
          >
              The card is not transferrable, it must be surrendered when the
              holder ceases to be a student of the school.
              <br />
              If found, report to the school, or the nearest police station
            
          </Typography>
          {/* <Typography
            variant="body2"
            fontSize={9}
            sx={{
              '@media Print': {
                fontSize: '13px',
              },
            }}
          >
            <strong>
              If found, report to the school, or the nearest police station.{' '}
            </strong>
          </Typography> */}
          <Box>
            <Box
              sx={{
                display: 'flex',
                marginTop: 'auto',
                justifyContent: 'center',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  gap: '10px',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <img
                  src="/signature.png"
                  alt="kogi-agile x world bank img"
                  style={{
                    width: '70px',
                  }}
                />
              </Box>
              <Typography
                variant="body2"
                sx={{
                  color: 'red',
                  '@media Print': {
                    fontSize: '12px',
                  },
                }}
              >
                <strong>Authorised Signature</strong>
              </Typography>
              {/* <Typography variant="body2" sx={{
                            color: "red",
                            "@media Print": {
                                fontSize: "12px",
                            }
                        }}><strong>Validity: 31 Dec, 2025</strong></Typography> */}
            </Box>
            {/* <Box sx={{ background: "#000", width: "100%", height: "20px", position: "absolute", bottom: 0, left: 0 }}></Box> */}
          </Box>
        </CardContent>
      </Card>
    )
};


