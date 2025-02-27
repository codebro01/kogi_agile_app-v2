import React from "react";
import { Card, CardContent, Typography, Avatar, Box } from "@mui/material";
import { QRCodeCanvas } from "qrcode.react";


export const StudentIDFront = ({ student }) => {
    console.log(student)
    return (
        <Card
            className="id-front"
            sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                width: "340px",
                height: "230px",
                borderRadius: 3,
                textAlign: "center",
                p: 1,
                boxShadow: 3,
                position: "relative",
                backgroundColor: "hsl(160deg 31.03% 94.31%)",

                "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    background: `url("/site-logo-dark-no-writeup.png")`,
                    backgroundSize: "35%",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                    opacity: 0.3, // ✅ Reduce opacity to make the background faint
                },

                "@media Print": {
                    width: "420px",
                    height: "280px",
                }
            }}
        >

            <Box sx={{
                display: "flex"
            }}>
                <Avatar
                    src={"/site-logo-dark-no-writeup.png"}
                    alt="Student"
                    sx={{
                        width: 60, height: 60, margin: "0 auto", alignSelf: "center",
                        "@media Print": {
                            width: 100,
                            height: 100,
                        }
                    }}
                />
                <Box sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                    alignItems: "flex-start",


                    padding: "10px",
                    "& > h2, & > h1": {
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "hsl(151.25deg 46.6% 40.39%)",

                        "@media Print": {
                            fontSize: "15px",
                        }


                    },



                }}>
                    <Typography variant="h2">
                        KOGI STATE ADOLESCENT GIRLS INITIATIVE
                    </Typography>
                    <Typography variant="h2">
                        FOR LEARNING AND EMPOWERMENT
                    </Typography>
                    <Typography variant="h1">
                        KOGI AGILE
                    </Typography>
                    <Typography variant="h1" sx={{ color: "red !important" }}>
                        ID CARD
                    </Typography>
                </Box>
            </Box>

            <CardContent
                sx={{
                    display: "flex",
                    padding: "0 8px",

                }}
            >
                <Box sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    justifyContent: "flex-start",
                    paddingTop: 0,
                    flexBasis: "80%",
                    "& > .rows-info": {
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "flex-start",
                        justifyContent: "flex-start",
                        gap: "10px",
                        width: "100%"

                    },
                    "& > .rows-info > .MuiTypography-body1 ": {
                        fontSize: "12px",
                        alignSelf: "flex-start",
                        justifySelf: "flex-start",
                        textAlign: "left",
                        "@media Print": {
                            fontSize: "14px"
                        }

                    },
                    "& > .rows-info > .MuiTypography-body1:first-child": {
                        flexBasis: "60%",
                        alignSelf: "flex-start",
                    },
                    "& > .rows-info > .MuiTypography-body1:second-child": {
                        flexBasis: "30%",
                    },

                    "& > .MuiTypography-body1 ": {
                        fontSize: "12px",
                        fontWeight: 800,
                        "@media Print": {
                            fontSize: "14px",

                        }
                    },
                }}>
                    <Box className="rows-info">
                        <Typography variant="body1"><strong>Student's ID: {student.randomId}</strong></Typography>
                        <Typography variant="body1"><strong>Class: {student.presentClass}</strong></Typography>
                    </Box>
                    <Typography variant="body1"><strong>Name: {student.firstname} {student.lastname}</strong></Typography>
                    <Box className="rows-info">
                        <Typography variant="body1"><strong>Date of Birth: {student.dob.split('T')[0]}</strong></Typography>
                        <Typography variant="body1"><strong>Cohort: {student.cohort}</strong></Typography>
                    </Box>
                    <Typography variant="body1" sx = {{textAlign: "left"}}>School: {student.schoolId.schoolName}</Typography>

                    <Typography variant="body1">Caregiver's Name: {student.parentName}</Typography>
                    <Typography variant="body1">Caregiver's Phone: 0{student.parentPhone}</Typography>
                    <Typography variant="body1" sx={{
                        color: "white", background: "red", width: "100%", fontSize: "11px", fontWeight: 800, position: "absolute", bottom: 0, left: 0,
                    }}>Conditional Cash Transfer</Typography>
                </Box>
                <img
                    src={student.passport}
                    alt="Student"
                    style={{
                        flexBasis: "20%", width: "80px", height: "100px", margin: "0 auto", alignSelf: "center", position: "absolute", top: "50%",
                        bottom: "33%", right: "15px"

                    }}
                />
            </CardContent>
        </Card>
    );
};


export const StudentIDBack = ({ student }) => {
    return (
        <Card sx={{
            width: "340px", height: "230px", borderRadius: 3, textAlign: "center", p: 1, boxShadow: 3, position: "relative",

            "@media Print": {
                width: "420px",
                height: "280px",
            }
        }}>
            <CardContent sx={{
                display: "flex",
                flexDirection: "column",
                gap: "5px",

                "@media Print": {
                    gap: "7px"
                }
            }}>
                <Typography fontSize={8} sx={{
                    "@media Print": {
                        fontSize: "10px",
                    }
                }} variant="body2"><strong>The bearer whose name and photograph appear overleaf is a student under the </strong></Typography>
                <Typography variant="body2" sx={{
                    textTransform: "uppercase",
                    "@media Print": {
                        fontSize: "14px",
                    }
                }}><strong>Kogi State Government <br /> Ministry of Education</strong> </Typography>


                <Box sx={{
                    display: "flex", gap: "50px", justifyContent: "center",
                }}>
                    <img src="/portal-landing-logo.png" alt="kogi-agile x world bank img" style={{
                        width: "130px",
                    }} />
                    <Box sx={{ mt: 1 }}>
                        <QRCodeCanvas value={`${student.name} - ${student.id}`} size={40} />
                    </Box>
                </Box>

                <Typography variant="body2" fontSize={9} sx={{
                    "@media Print": {
                        fontSize: "14px",
                    }
                }}><strong>The card is not transferrable, it must be surrendered when the holder ceases to be a student of the school.</strong> </Typography>
                <Typography variant="body2" fontSize={9} sx={{
                    "@media Print": {
                        fontSize: "13px",
                    }
                }}><strong>If found, report to the school, or the nearest police station. </strong></Typography>
                <Box>
                    <Box sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "10px",
                        marginTop: "auto"
                    }}>
                        <Typography variant="body2" sx={{
                            "@media Print": {
                                fontSize: "12px",
                            }
                        }}><strong>Authorised Signature</strong></Typography>
                        <Typography variant="body2" sx={{
                            color: "red",
                            "@media Print": {
                                fontSize: "12px",
                            }
                        }}><strong>Validity: 31 Dec, 2025</strong></Typography>
                    </Box>
                    <Box sx={{ background: "#000", width: "100%", height: "20px", position: "absolute", bottom: 0, left: 0 }}></Box>

                </Box>
            </CardContent>
        </Card>
    );
};


