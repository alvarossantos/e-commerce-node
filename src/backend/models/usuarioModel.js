const bcrypt = require("bcryptjs");

class Usuario {
  constructor({
    id,
    nome,
    email,
    senha,
    cpf,
    data_nascimento,
    telefone,
    url_foto,
    criado_em,
    ativo,
    is_admin,
  }) {
    this.id = id;
    this.nome = nome;
    this.email = email;
    this.senha_hash = senha;
    this.cpf = cpf;
    this.data_nascimento = data_nascimento;
    this.telefone = telefone;
    this.url_foto = url_foto || "/img/usuarios/default.png";
    this.criado_em = criado_em;
    this.ativo = ativo !== undefined ? ativo : true;
    this.is_admin = is_admin || false;
  }

  // Método para encriptar a senha do usuário
  async encriptarSenha() {
    if (this.senha_hash) {
      const salt = await bcrypt.genSalt(10);
      this.senha_hash = await bcrypt.hash(this.senha_hash, salt);
    }
  }

  // Método que será usado no Login
  async compararSenha(senha) {
    return await bcrypt.compare(senha, this.senha_hash);
  }
}

module.exports = Usuario;
