import { createTheme, ThemeProvider } from '@mui/material'
import darkScrollbar from '@mui/material/darkScrollbar'
import { ThemeContext } from './ThemeContext/ThemeContext'
import React, { useState } from 'react'

import './App.css'
import { Main } from './main/Main'

const theme = createTheme({
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          "*::-webkit-scrollbar": {
            width: "10px"
          },
          "*::-webkit-scrollbar-track": {
            background: "#E4EFEF"
          },
          "*::-webkit-scrollbar-thumb": {
            background: "#1D388F61",
            borderRadius: "2px"
          }
        }
      },
    },
  },
})

const darkTheme = createTheme({
  ...theme,
  palette: {
    background: {
      default: '#111111',
      paper: '#121212'
    },
    text: {
      primary: '#cecece',
      secondary: '#444444',
      disabled: '#666666',
    },
    primary: {
      main: '#262688',
    },
    secondary: {
      main: '#77aa33',
    },
  }
})

function App() {
  const [themeName, setTheme] = useState('dark')
  const themeMap = {
    light: theme,
    dark: darkTheme,
  }
  return (
    <div className="App">
      <ThemeContext.Provider value={{ setTheme, themeName }}>
        <ThemeProvider theme={themeMap[themeName]}>
          <Main />
        </ThemeProvider>
      </ThemeContext.Provider>
    </div>
  )
}

export default App
