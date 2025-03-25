import React from 'react';
import { Box, Typography,} from '@mui/material';

const Starred = () => {

    return (
        <Box sx={{ mt: 1 }}>
            <Typography variant="h6" sx={{ fontSize: '18px', fontWeight: 'bold' }}>
                Starred Files
            </Typography>
        </Box>
    );
};

export default Starred;