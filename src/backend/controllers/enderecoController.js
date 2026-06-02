const EnderecoRepository = require('../repositories/enderecoRepository');

exports.adicionar = async (req, res) => {
    try {
        const { cep, logradouro, numero, bairro, cidade, estado, complemento } = req.body;

        // 🚨 TRAVA DE SEGURANÇA: Impede o servidor de crashar se a UF não for enviada
        if (!estado) {
            return res.redirect('/checkout?erro=O campo Estado (UF) é obrigatório para entrega.');
        }

        const novoEndereco = {
            usuario_id: req.usuarioLogado.id,
            cep,
            logradouro,
            numero,
            bairro,
            cidade,
            estado: estado.toUpperCase(), // Agora é seguro usar!
            complemento
        };

        await EnderecoRepository.criar(novoEndereco);

        // Volta para o checkout
        res.redirect('/checkout?sucesso=Endereço adicionado com sucesso!');
    } catch (erro) {
        console.error("=== ERRO AO ADICIONAR ENDEREÇO ===", erro);
        res.redirect('/checkout?erro=Não foi possível salvar o endereço. Verifique os dados.');
    }
};