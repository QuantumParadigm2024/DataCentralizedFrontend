import React from 'react';
import { Box, Typography } from '@mui/material';

const Bin = () => {
  return (
    <Box sx={{
      height: '200px', // Adjust height as needed
      background: 'linear-gradient(135deg,#ba343b 30%,black 70%)',
      clipPath: 'polygon(0 0, 0% 0, 100% 100%, 0 100%)',
      position: 'relative',
    }}>
      <Typography
        variant="h4"
        sx={{
          color: 'black',
          position: 'absolute',
          bottom: '20px',
          left: '30px',
        }}
      >
        My Applications
      </Typography>
    </Box>
  );
};

export default Bin;
