import React, { useEffect, useState } from 'react'
import { Slider, Stack, Typography } from '@mui/material'
import {
  Box,
} from '@mui/system'
import IconButton from '@mui/material/IconButton'
import {
  VolumeDown,
  FastRewindRounded,
  PlayArrowRounded,
  PauseRounded,
  FastForwardRounded,
  VolumeUpRounded,
  VolumeDownRounded,
} from '@mui/icons-material/'

// const lightIconColor = '#909090'
// const mainIconColor = '434343'

const Controls = ({
  seek,
  setSeek,
  duration,
  paused,
  setPaused,
  onNext,
  onPrev,
  volume,
  onSetVolume,
}) => {
  const [slidervalue, setSliderValue] = useState(0)
  const [clicked, setClicked] = useState(false)

  useEffect(() => {
    if(!clicked) {
      setSliderValue(seek / duration * 100)
    }
  }, [clicked, seek])

  const formatTime = secs => {
    const minutes = Math.floor(secs / 60) || 0
    const seconds = secs - minutes * 60 || 0

    return minutes + ':' + (seconds < 10 ? '0' : '') + seconds
  }

  const stringSeek = formatTime(Math.round(seek))
  const stringDuration = formatTime(Math.round(duration))

  return (
    <Box p={2}>
      <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
        <Slider
          sx={{
            height: 34,
            borderRadius: 34,
            '& .MuiSlider-track': {
              height: 20,
              border: 'none',
            },
            '& .MuiSlider-thumb': {
              width: 32,
              height: 32,
              '&:before': {
                boxShadow: '0 4px 8px rgba(0,0,0,0.4)',
              },
            },
          }}
          color="secondary"
          aria-label="Volume"
          value={slidervalue}
          onMouseDown={() => setClicked(true)}
          onMouseUp={() => setClicked(false)}
          onChange={(_, value) => setSliderValue(value)}
          onChangeCommitted={(_, value) => setSeek(value)}
        />
      </Stack>
      <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mt: -2,
          }}
        >
          <Typography variant="caption">{stringSeek}</Typography>
          <Typography variant="caption">{stringDuration}</Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mt: -1,
          }}
        >
          <IconButton size="large" onClick={() => onPrev()} aria-label="previous song" color="primary">
            <FastRewindRounded fontSize="large" />
          </IconButton>
          <IconButton
            aria-label={paused ? 'play' : 'pause'}
            onClick={() => setPaused(!paused)}
            size="large"
            color="primary"
          >
            {paused ? (
              <PlayArrowRounded
                sx={{ fontSize: '3rem' }}
                // htmlColor={mainIconColor}
              />
            ) : (
              <PauseRounded sx={{ fontSize: '3rem' }} />
            )}
          </IconButton>
          <IconButton size="large" onClick={() => onNext()} aria-label="next song" color="primary">
            <FastForwardRounded fontSize="large" />
          </IconButton>
        </Box>
        <Stack spacing={2} direction="row" sx={{ mb: 1, px: 1 }} alignItems="center">
          <VolumeDownRounded/>
          <Slider
            aria-label="Volume"
            value={volume}
            onChange={(_, value) => onSetVolume(value)}
            sx={{
              height: 26,
              borderRadius: 26,
              color: 'text.disabled',
              '& .MuiSlider-track': {
                border: 'none',
              },
              '& .MuiSlider-thumb': {
                width: 24,
                height: 24,
                backgroundColor: '#fff',
                '&:before': {
                  boxShadow: '0 4px 8px rgba(0,0,0,0.4)',
                },
                '&:hover, &.Mui-focusVisible, &.Mui-active': {
                  boxShadow: 'none',
                },
              },
            }}
          />
          <VolumeUpRounded />
        </Stack>
    </Box>
  )
}

export default Controls
