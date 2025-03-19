import React from 'react';
import { Box } from '@mui/material';

const Bin = () => {
  return (
    <Box sx={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <Box
        sx={{
          height: '100%',
          width: '100%',
          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.1) 10%,rgba(226, 95, 95, 0.6) 50%,rgb(214, 136, 140) 90%)',
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
          background: 'linear-gradient(135deg, #ba343b 10%, rgba(194, 92, 92, 0.6) 50%, rgba(170, 41, 41, 0.1) 90%)',
          clipPath: 'polygon(90% 0, 0 0, 0 100%, 0 100%)',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      />
    </Box>
  );
};

export default Bin;