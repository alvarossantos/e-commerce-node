const UsuarioRepository = require('../repositories/usuarioRepository');
const EnderecoRepository = require('../repositories/enderecoRepository');
const Usuario = require('../models/usuarioModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { SECRET } = require('../services/authService');

exports.renderizarPerfil = async (req, res) => {
    try {
        const usuarioId = req.usuarioLogado.id;
        const usuario = await UsuarioRepository.buscarPorId(usuarioId);
        const enderecos = await EnderecoRepository.listarPorUsuario(usuarioId);

        res.render('perfil', {
            layout: 'layout_cliente',
            usuario,
            enderecos,
            erro: req.query.erro || null,
            sucesso: req.query.sucesso || null
        });
    } catch (erro) {
        console.error("=== ERRO AO RENDERIZAR PERFIL ===", erro);
        res.status(500).json({ mensagem: 'Erro interno ao renderizar perfil.' });
    }
};

exports.atualizarDados = async (req, res) => {
    try {
        const usuarioId = req.usuarioLogado.id;
        const { nome, telefone, senha } = req.body;

        const usuarioAtual = await UsuarioRepository.buscarPorId(usuarioId);
        let novaSenhaHash = usuarioAtual.senha_hash;

        if (senha && senha.trim() !== '') {
            const salt = await bcrypt.genSalt(10);
            novaSenhaHash = await bcrypt.hash(senha, salt);
        }

        const dadosAtualizados = {
            nome,
            telefone, 
            senha_hash: novaSenhaHash,
            url_foto: usuarioAtual.url_foto
        }

        const usuarioSalvo = await UsuarioRepository.atualizarPerfil(usuarioId, dadosAtualizados);

        const token = jwt.sign({
            id: usuarioSalvo.id,
            nome: usuarioSalvo.nome,
            is_admin: usuarioSalvo.is_admin,
            url_foto: usuarioSalvo.url_foto
        }, SECRET, { expiresIn: '24h' });

        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });

        res.redirect('/perfil?sucesso=Dados atualizados com sucesso!');
    } catch (erro) {
        console.error("=== ERRO AO ATUALIZAR DADOS ===", erro);
        res.status(500).json({ mensagem: 'Erro interno ao atualizar dados.' });
    }
};

exports.atualizarFoto = async (req, res) => {
    try {
        const usuarioId = req.usuarioLogado.id;
        let caminhoFoto = req.body.url_foto; 

        // Se o utilizador enviou um arquivo físico (agora no formato de Buffer na memória)
        if (req.file) {
            // Vamos forçar que a extensão seja sempre .webp para máxima compressão
            const nomeArquivo = `avatar_${usuarioId}_${Date.now()}.webp`;
            const caminhoDestinoAbsoluto = path.join(process.cwd(), 'src', 'frontend', 'static', 'img', 'usuarios');
            
            // Garante que a pasta existe
            if (!fs.existsSync(caminhoDestinoAbsoluto)) {
                fs.mkdirSync(caminhoDestinoAbsoluto, { recursive: true });
            }

            const caminhoCompleto = path.join(caminhoDestinoAbsoluto, nomeArquivo);

            // 💡 A MÁGICA DO SHARP: Redimensiona, converte e salva!
            await sharp(req.file.buffer)
                .resize(300, 300, { fit: 'cover' }) // Corta em um quadrado perfeito de 300x300
                .webp({ quality: 80 })              // Converte para WEBP com 80% de qualidade
                .toFile(caminhoCompleto);           // Salva fisicamente no disco

            caminhoFoto = `/img/usuarios/${nomeArquivo}`;
        }

        if (!caminhoFoto) {
            return res.redirect('/perfil?erro=Nenhuma imagem selecionada ou link fornecido.');
        }

        // Atualiza no banco
        await UsuarioRepository.atualizarFoto(usuarioId, caminhoFoto);
        
        // Atualiza o Cookie
        const token = jwt.sign({
            id: req.usuarioLogado.id,
            nome: req.usuarioLogado.nome,
            is_admin: req.usuarioLogado.is_admin,
            url_foto: caminhoFoto 
        }, SECRET, { expiresIn: '24h' });

        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
        res.redirect('/perfil?sucesso=Foto de perfil processada e atualizada com sucesso!');
    } catch (erro) {
        console.error("=== ERRO AO ATUALIZAR FOTO ===", erro);
        res.redirect('/perfil?erro=Erro ao processar a imagem. Tente uma foto diferente.');
    }
};

exports.renderizarFormEndereco = async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioId = req.usuarioLogado.id;

        let endereco = null;

        if (id) {
            endereco = await EnderecoRepository.buscarPorId(id, usuarioId);
        }

        res.render('form_endereco', { layout: 'layout_cliente', endereco });
    } catch (erro) {
        console.error("=== ERRO AO RENDERIZAR FORMULÁRIO DE ENDEREÇO ===", erro);
        res.status(500).json({ mensagem: 'Erro interno ao renderizar formulário de endereço.' });
    }
};

exports.salvarEndereco = async (req, res) => {
    try {
        const usuarioId = req.usuarioLogado.id;
        const { id } = req.params;
        const { logradouro, numero, bairro, cidade, estado, cep, complemento } = req.body;

        const dadosEndereco = { usuario_id: usuarioId, logradouro, numero, bairro, cidade, estado, cep, complemento };
        
        if (id) {
            await EnderecoRepository.atualizar(id, usuarioId, dadosEndereco);
        } else {
            await EnderecoRepository.criar(dadosEndereco);
        }

        res.redirect('/perfil?sucesso=Endereço salvo com sucesso!');
    } catch (erro) {
        console.error("=== ERRO AO SALVAR ENDEREÇO ===", erro);
        res.status(500).json({ mensagem: 'Erro interno ao salvar endereço.' });
    }
};

exports.excluirEndereco = async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioId = req.usuarioLogado.id;

        await EnderecoRepository.deletar(id, usuarioId);
        res.redirect('/perfil?sucesso=Endereço excluído com sucesso!');
    } catch (erro) {
        console.error("=== ERRO AO EXCLUIR ENDEREÇO ===", erro);
        res.status(500).json({ mensagem: 'Erro interno ao excluir endereço.' });
    }
};