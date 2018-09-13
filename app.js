const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron')
const path = require('path')
const url = require('url')
const mysql = require('mysql')

let mainWin = null, addWin = null

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'electron_app'
})

const { exec } = require('child_process')

exec('"mysqld"', (err, stdout, stderr) => {
    if(err)
        console.log(err)
    console.log(stdout)
    console.log(stderr)
})

setTimeout(() => connection.connect(err => {
    console.error(err)
}), 4000)


process.env.NODE_ENV = 'development'

let createWin = ((file, obj = {}) => {
    let win
    obj.width = obj.width || 800
    obj.height = obj.height || 600
    obj.show = obj.show || true
    obj.minHeight = 76
    obj.minWidth = 523

    win = new BrowserWindow(obj)

    win.loadURL(url.format({
        pathname: path.join(__dirname, `views/${file}.html`),
        protocol: 'file',
        slashes: true
    }))

    return win
})

app.on('ready', () => {
    mainWin = createWin('main')
    mainWin.once('ready-to-show', () => {
        mainWin.show()
    })
    mainWin.on('closed', () => {
        connection.end()
        app.quit()
    })
    const mainMenu = Menu.buildFromTemplate(mainMenuTp)
    Menu.setApplicationMenu(mainMenu)
    setTimeout(() => connection.query('select * from contatos', (err, res, fi) => {
        console.log(res)
        mainWin.webContents.send('banco:datas', res)
    }), 5000)
})


function createAddWindow() {
    addWin = createWin('add', { width: 320, height: 180, title: 'Add Item', frame: false, resizable: false })

    addWin.on('close', () => addWin = null)
}

ipcMain.on('banco:add', async (e, item) => {
    // mainWin.webContents.send('banco:s', d)
    connection.query(`insert into contatos (nome, telefone, email, idade) values ("${item.nome}", "${item.telefone || null}", "${item.email || null}", ${item.idade || null})`, (error, results, fields) => {
        if (error)
            console.error(error)
        connection.query('select * from contatos', (err, res, fi)=>{
            mainWin.webContents.send('banco:datas', res)
        })
    })
})

const mainMenuTp = [
    {
        label: 'Manage',
        submenu: [
            {
                label: 'Adicionar Campo',
                accelerator: 'CommandOrControl+D',
                click() { createAddWindow() }
            },
            {
                label: 'To Exit in Other Window Press',
                accelerator: 'Esc',
                click(item, focusedWindow) { if (focusedWindow !== mainWin) { focusedWindow.close() } }
            },
            {
                label: 'Quit',
                accelerator: 'CommandOrControl+Q',
                click() { app.quit() }
            }
        ]
    }
]

if (process.platform == 'darwin')
    mainMenuTp.unshift({})

if (process.env.NODE_ENV !== 'production')
    mainMenuTp.push({
        label: 'Developer Tools',
        submenu: [
            {
                label: 'Toogle Devtools',
                accelerator: 'CommandOrControl+I',
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools()
                }
            },
            { role: 'reload' }
        ]
    })