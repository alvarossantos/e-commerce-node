const Usuario = require("../models/usuarioModel");
const UsuarioRepository = require("../repositories/usuarioRepository");

exports.criar = async (req, res) => {
  try {
    const {
      nome,
      email,
      senha,
      cpf,
      data_nascimento,
      telefone,
      url_foto,
    } = req.body;

    const novoUsuario = new Usuario({
      nome,
      email,
      senha,
      cpf,
      data_nascimento,
      telefone,
      url_foto,
      is_admin: false,
    });
    await novoUsuario.encriptarSenha();

    const usuarioCriado = await UsuarioRepository.criar(novoUsuario);
    res.status(201).json({
      mensagem: "Usuário criado com sucesso!",
      usuario: usuarioCriado,
    });
  } catch (erro) {
    console.error(erro);

    // 23505 é o código do PostgreSQL para violação de restrição UNIQUE
    if (erro.code === "23505") {
      return res
        .status(400)
        .json({ mensagem: "E-mail ou CPF já estão cadastrados." });
    }
    res.status(500).json({ mensagem: "Erro ao criar usuário." });
  }
};

exports.listar = async (req, res) => {
  try {
    const usuarios = await UsuarioRepository.listarTodos();
    res.status(200).json(usuarios);
  } catch (erro) {
    console.log("=== ERRO AO LISTAR USUARIOS === : ", erro);
    res.status(500).json({ mensagem: "Erro ao listar usuários." });
  }
};

exports.buscar = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await UsuarioRepository.buscarPorId(id);

    if (!usuario) {
      return res.status(404).json({ mensagem: "Usuário não encontrado." });
    }
    res.status(200).json(usuario);
  } catch (erro) {
    res.status(500).json({ mensagem: "Erro ao buscar usuário." });
  }
};

exports.atualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, senha, telefone } = req.body;

    // Verifica se o usuário existe no banco de dados
    const usuarioExistente = await UsuarioRepository.buscarPorId(id);
    if (!usuarioExistente) {
      return res.status(404).json({ mensagem: "Usuário não encontrado." });
    }

    // Verifica se o usuário digitou uma nova senha, gerando um novo hash
    let senhaFinalHash;
    if (senha && senha.trim() !== "") {
      const usuarioTemp = new Usuario({ senha });
      await usuarioTemp.encriptarSenha();
      senhaFinalHash = usuarioTemp.senha_hash;
    } else {
      // O buscarPorId não traz a senha por segurança,
      // busca o registro completo usando o email
      const usuarioCompleto = await UsuarioRepository.buscarPorEmail(
        usuarioExistente.email,
      );
      senhaFinalHash = usuarioCompleto.senha_hash;
    }

    const dadosAtualizados = {
      id: parseInt(id),
      nome: nome || usuarioExistente.nome,
      telefone: telefone || usuarioExistente.telefone,
      senha_hash: senhaFinalHash,
    };

    // Exexuta a atualização no repository
    const usuarioAtualizado =
      await UsuarioRepository.atualizarUsuario(dadosAtualizados);

    res.status(200).json({
      mensagem: "Usuário atualizado com sucesso!",
      usuario: usuarioAtualizado,
    });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: "Erro ao atualizar usuário." });
  }
};

exports.atualizarFoto = async (req, res) => {
  try {
    const { id } = req.params;
    const { url_foto } = req.body;

    if (!url_foto) {
      return res.status(400).json({ mensagem: "URL da foto é obrigatória." });
    }

    const fotoAtualizada = await UsuarioRepository.atualizarFoto(id, url_foto);

    if (!fotoAtualizada) {
      return res.status(404).json({ mensagem: "Usuário não encontrado." });
    }

    res.status(200).json({
      mensagem: "Foto do usuário atualizada com sucesso!",
      foto: fotoAtualizada,
    });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: "Erro ao atualizar foto do usuário." });
  }
};

exports.inativarConta = async (req, res) => {
  try {
    const { id } = req.params;

    const usuarioInativo = await UsuarioRepository.inativarConta(id);

    if (!usuarioInativo) {
      return res.status(404).json({ mensagem: "Usuário não encontrado." });
    }

    res.status(200).json({
      mensagem:
        "Conta inativada com sucesso! O usuário não poderá mais realizar login.",
      usuario: usuarioInativo,
    });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: "Erro ao inativar conta do usuário." });
  }
};
