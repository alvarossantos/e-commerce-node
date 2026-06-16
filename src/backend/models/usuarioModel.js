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
    this.senha_clara = undefined;
    this.senha_hash = undefined;
    this.cpf = cpf;
    this.data_nascimento = data_nascimento;
    this.telefone = telefone;
    this.url_foto = url_foto || "/img/usuarios/default.png";
    this.criado_em = criado_em;
    this.ativo = ativo !== undefined ? ativo : true;
    this.is_admin = is_admin || false;

    // Se a senha já vier do banco (hash), atribui diretamente ao hash.
    // Se vier em texto claro, armazena separadamente para criptografar depois.
    if (senha) {
      // Heurística: hashes bcrypt começam com "$2a$", "$2b$" ou "$2y$"
      if (senha.startsWith("$2")) {
        this.senha_hash = senha;
      } else {
        this.senha_clara = senha;
      }
    }
  }

  /**
   * Criptografa a senha em texto claro e armazena em senha_hash.
   * Só executa se houver senha_clara pendente (evita double hash).
   */
  async encriptarSenha() {
    if (this.senha_clara) {
      const salt = await bcrypt.genSalt(10);
      this.senha_hash = await bcrypt.hash(this.senha_clara, salt);
      this.senha_clara = undefined; // Limpa por segurança
    }
  }

  // Método que será usado no Login
  async compararSenha(senha) {
    return await bcrypt.compare(senha, this.senha_hash);
  }
}

module.exports = Usuario;
