const bcrypt = require('bcrypt-nodejs')
module.exports = app => {

    const { existsOrError, notExistsOrError, equalsOrError } = app.api.validacao

    const { Pessoa } = app.classes.pessoa
    const { salvarMedico } = app.api.medico
    const { salvarPaciente } = app.api.paciente

    const encriptarSenha = senha => {
        const salt = bcrypt.genSaltSync(10)
        
        return bcrypt.hashSync(senha, salt) 
    }

    const salvar = async(req, res) => {

        const usuario = { ...req.body}

        try{
            
            existsOrError(usuario.cpf, "CPF não informado!")
            existsOrError(usuario.nome, "Nome não informado!")
            existsOrError(usuario.senha, "Senha não informada!")
            existsOrError(usuario.confirmacaoSenha, "Confirmação de senha não informada!")
            equalsOrError(usuario.senha, usuario.confirmacaoSenha, "Senhas não conferem!")
        
            const usuarioFromDB = await app.db("pessoa") 
                .where({cpf: usuario.cpf}).first()

            notExistsOrError(usuarioFromDB, "Usuário já cadastrado!") 

        } catch (msg) {
            return res.status(400).send(msg)
        }
        
        usuario.senha = encriptarSenha(usuario.senha)
        delete usuario.confirmacaoSenha 
        
        if(!isUsuario(req.params.tipo)) {
            delete usuario.adm
        }

        req.body = usuario

        if (isMedico(req.params.tipo)) {
            salvarMedico(req, res)
            
        } else if (isPaciente(req.params.tipo)){
            salvarPaciente(req, res)

        } else if (isUsuario(req.params.tipo)) {

            const usuario_ = new Pessoa(usuario.cpf, usuario.nome, usuario.senha, usuario.adm)

            usuario_.salvarDados()

            res.status(204).send()
        }
    }



    // ----------- Funções ---------------

    function isMedico(tipo) {
        if (tipo === 'medico') {
            return true
        }
        return false
    }

    function isPaciente(tipo) {
        if (tipo === 'paciente') {
            return true
        }
        return false
    }

    function isUsuario(tipo) {
        if (tipo === 'usuario') {
            return true
        }
        return false
    }
    

    return { salvar }
}