import React from 'react';
import { Box, Typography } from '@mui/material';
const Bin = () => {
  return (
    <Box sx={{ position: 'relative', height: '80px' }}>
      <Box
        sx={{
          height: '100%',
          width: '100%',
          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.1) 10%,rgba(53, 43, 43, 0.6) 50%, #ba343b 90%)',
          clipPath: 'polygon(10% 0, 0 0, 100% 0, 100% 100%)',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      />
      <Box
        sx={{
          height: '100%',
          width: '100%',
          background: 'linear-gradient(135deg, #ba343b 10%, rgba(53, 43, 43, 0.6) 40%, rgba(121, 92, 92, 0.1) 90%)',
          clipPath: 'polygon(90% 0, 0 0, 0 100%, 0 100%)',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      />
      <Typography sx={{ml: "190px" , fontSize: "35px" }}>Quantum Center</Typography>
    </Box>
  );
};

export default Bin;
