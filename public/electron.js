const {
  app,
  BrowserWindow,
  dialog,
  Menu,
  ipcMain,
  autoUpdater
} = require('electron')
const path = require('path')
const url = require('url')
const fs = require('fs')
// const openAboutWindow = require('about-window').default
const isDev = require('electron-is-dev')
const storage = require('electron-json-storage')

storage.getDataPath()
let status = 0

// if (isDev) {
//     require('electron-reload')(__dirname, {
//         electron: require(`${__dirname}/node_modules/electron`)
//     });
// } else {
//     const server = 'http://hazel-duskplayer.vercel.app/';
//     const url = `${server}/update/${process.platform}/${app.getVersion()}`;

//     autoUpdater.setFeedURL({ url });
// }

function createMenu(theme, sort) {
  function handleClick(menuItem, browserWindow, event) {
    win.webContents.send('theme-change', {
      theme: menuItem.label.toLowerCase()
    })
    storage.set(
      'theme',
      { theme: menuItem.label.toLowerCase() },
      function (error) {
        if (error) throw error
      }
    )
  }

  function handleSort(menuItem, browserWindow, event) {
    const items = menuItem.menu.items
    win.webContents.send('sort-change', { items: items })
  }

  /**
   * Because menu buttons on MacOS *require* at least one submenu,
   * store them in variables inorder to modify them if application is
   * running on Mac.
   */
  let openFolder = {
    label: 'Folders',
    accelerator: 'CommandOrControl+o',
    click: function () {
      openFolderDialog()
    }
  }

  const info = {
    label: 'Info',
    click: function () {
      // openAboutWindow({
      //   product_name: 'Dusk Player',
      //   homepage: 'https://home.aveek.io',
      //   copyright: 'By Aveek Saha',
      //   description: 'A minimal music player for your desktop',
      //   license: 'MIT',
      //   icon_path: path.join(__dirname, 'build/icon.png')
      // })
    }
  }

  theme = {
    label: 'Theme',
    submenu: [
      {
        label: 'Light',
        type: 'radio',
        click: handleClick,
        checked: theme.light
      },
      {
        label: 'Dark',
        type: 'radio',
        click: handleClick,
        checked: theme.dark
      },
      {
        label: 'Disco',
        type: 'radio',
        click: handleClick,
        checked: theme.disco
      }
    ]
  }

  sort = {
    label: 'Sort',
    submenu: [
      {
        label: 'Date added',
        type: 'radio',
        click: handleSort,
        checked: sort.by.dateAdded
      },
      {
        label: 'Song name',
        type: 'radio',
        click: handleSort,
        checked: sort.by.songName
      },
      {
        label: 'Artist name',
        type: 'radio',
        click: handleSort,
        checked: sort.by.artistName
      },
      {
        label: 'Default',
        type: 'radio',
        click: handleSort,
        checked: true
      },
      { type: 'separator' },
      {
        label: 'Ascending',
        type: 'radio',
        click: handleSort,
        checked: sort.order.asc
      },
      {
        label: 'Descending',
        type: 'radio',
        click: handleSort,
        checked: sort.order.dec
      }
    ]
  }

  if (process.platform === 'darwin') {
    openFolder = {
      label: 'Folders',
      submenu: [
        {
          label: 'Open folder',
          accelerator: 'CommandOrControl+o',
          click: function () {
            openFolderDialog()
          }
        }
      ]
    }

    const info = {
      label: 'Info',
      submenu: [
        {
          label: 'Show info',

          click: function () {
            // openAboutWindow({
            //   product_name: 'Dusk Player',
            //   homepage: 'https://home.aveek.io',
            //   copyright: 'By Aveek Saha',
            //   icon_path: path.join(__dirname, 'build/icon.png')
            // })
          }
        }
      ]
    }

    createMenuMac(openFolder, theme, info, sort)
  } else {
    createMenuOther(openFolder, theme, info, sort)
  }
}

let win

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    fullscreen: true,
    width: 1000,
    height: 620,
    title: 'Carplayer',
    icon: __dirname + '/dusk.png',
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      backgroundThrottling: false
    }
  })

  const light = false
  let dark = false
  const disco = false

  const asc = true
  const dec = false

  const songName = false
  const artistName = false
  const dateAdded = false

  const theme = { light, dark, disco }
  const sort = { order: { asc, dec }, by: { songName, artistName, dateAdded } }

  storage.has('theme', function (error, hasKey) {
    if (error) throw error
    if (hasKey) {
      storage.get('theme', function (error, data) {
        if (error) throw error

        if (data.theme == 'light') theme.light = true
        else if (data.theme == 'disco') theme.disco = true
        else theme.dark = true

        createMenu(theme, sort)
      })
    } else {
      dark = true
      createMenu(theme, sort)
    }
  })

  // and load the index.html of the app.
  win.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  )

  // Open the DevTools.
  if (isDev) win.webContents.openDevTools()

  win.on('close', e => {
    if (status == 0) {
      if (win) {
        e.preventDefault()
        win.webContents.send('save-settings')
      }
    }
  })

  // Emitted when the window is closed.
  win.on('closed', () => {
    win = null
  })
}

ipcMain.on('closed', () => {
  status = 1
  // mainWindow = null
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('ready', () => {
  createWindow()
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})

function openFolderDialog() {
  dialog.showOpenDialog(win, { properties: ['openDirectory'] }).then(
    result => {
      const filePath = result.filePaths[0]
      if (filePath) {
        storage.set('path', { path: filePath }, function (error) {
          if (error) throw error
        })

        scanDir(filePath)
      }
    },
    error => {
      throw error
    }
  )
}

// var walkSync = function (dir, filelist) {
//   files = fs.readdirSync(dir)
//   filelist = filelist || []
//   files.forEach(function (file) {
//     if (fs.statSync(path.join(dir, file)).isDirectory()) {
//       filelist = walkSync(path.join(dir, file), filelist)
//     } else {
//       if (
//         file.endsWith('.mp3') ||
//         file.endsWith('.m4a') ||
//         file.endsWith('.webm') ||
//         file.endsWith('.wav') ||
//         file.endsWith('.aac') ||
//         file.endsWith('.ogg') ||
//         file.endsWith('.opus')
//       ) {
//         filelist.push(path.join(dir, file))
//       }
//     }
//   })
//   return filelist
// }

function scanDir(filePath) {
  if (!filePath || filePath[0] == 'undefined') return

  win.webContents.send('selected-files', filePath)
}

function createMenuOther(openFolder, theme, info, sort) {
  const menu = Menu.buildFromTemplate([openFolder, theme, sort, info])
  Menu.setApplicationMenu(menu)
}

function createMenuMac(openFolder, theme, sort, info) {
  const menu = Menu.buildFromTemplate([
    {
      label: require('electron').app.getName(),
      submenu: [
        {
          role: 'quit',
          accelerator: 'Cmd+Q'
        }
      ]
    },
    openFolder,
    theme,
    sort,
    info
  ])
  Menu.setApplicationMenu(menu)
}
