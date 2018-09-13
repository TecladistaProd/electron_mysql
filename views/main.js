const { ipcRenderer } = require('electron')

document.querySelector('form').addEventListener('submit', (e)=> {
    e.preventDefault()
    const retObj = {}
    e.target.querySelectorAll('input').forEach(element => {
        retObj[element.id] = element.value
        element.value = ''
    })
    ipcRenderer.send('banco:add', retObj)
})

ipcRenderer.on('banco:datas', (e, items) => {
    const contatos = document.querySelector('.contatos')
    contatos.innerHTML = ''
    items.forEach(contato=> {
        let iHtml = '<div class="contato">'
        iHtml += `<p><strong>Nome:</strong> ${contato.nome}</p>`
        iHtml += `<p><strong>Email:</strong> ${contato.email}</p>`
        iHtml += `<p><strong>Telefone:</strong> ${contato.telefone}</p>`
        iHtml += `<p><strong>Idade:</strong> ${contato.idade}</p>`
        iHtml += '</div>'
        contatos.innerHTML += iHtml
    })
})
