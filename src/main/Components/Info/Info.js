import React from 'react'
import {
  Box,
  Typography
} from '@mui/material'

const Info = ({
  image,
  trackName,
  trackAlbum,
  trackArtist
}) => (
  <Box sx={{
    width: '100%',
    backgroundImage: `url(${image})`,
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'contain',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
  }}>
    <Typography paragraph>{trackName}</Typography>
    <Typography variant="caption">{trackArtist}</Typography>
  </Box>
)

export default Info
