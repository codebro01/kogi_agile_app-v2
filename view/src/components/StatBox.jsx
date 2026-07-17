import { Box, Typography, useTheme } from "@mui/material";
import { tokens } from "../theme";

const StatBox = ({ title, subtitle, icon, progress, increase, bgColor, titleColor, subtitleColor }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box width="100%" p="15px" mx={{
      width: "100%",
      borderRadius: "5px",
      minHeight: "100px"
    }} backgroundColor={bgColor}
    >
      <Box display="flex" justifyContent="center" alignItems={"center"} >
        <Box>
          <Typography
            variant="h3"
            fontWeight="bold"
            sx={{ 
              color: titleColor || "#fff",
              fontSize: {
                xs: '1.1rem',
                md: '1.5rem',
                lg: '1.8rem',
              },
              lineHeight: 1.2,
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
              maxWidth: '100%',
            }}
            textAlign={"center"}
          >
            {title}
          </Typography>
        </Box>
      </Box>
      <Box display="flex" justifyContent="center" mt="3px">
        <Typography variant="h5" sx={{ 
          textAlign: "center",
          fontWeight: "700",
          color: subtitleColor || "inherit"
          }}>
          {subtitle}
        </Typography>
        <Typography
          variant="h5"
          fontStyle="italic"
          sx={{ color: colors.redAccent[600] }}
        >
          {increase}
        </Typography>

      </Box>
    </Box>
  );
};

export default StatBox;
