pragma solidity ^0.8.0; // SPDX-License-Identifier: MIT

contract Upload {
    struct Acesso {
        address user;
        bool acess;
    }

    mapping(address => string[]) valor; // Mapping para armazenar os CIDs dos arquivos
    mapping(address => mapping(address => bool)) private permissoes; // Mapping para gerenciar permissões de acesso a arquivos
    mapping(address => Acesso[]) private listaDeAcesso; // Mapping para rastrear quem tem acesso aos arquivos do usuário
    mapping(address => mapping(address => bool)) private dadoAnterior; // Mapping para rastrear se houve histórico de acesso entre dois usuários

    // Função para adicionar um arquivo (CID) à lista de arquivos do usuário
    function add(string memory cid) external {
        valor[msg.sender].push(cid);
    }

    // Função para conceder acesso a todos os arquivos do usuário a outro usuário
    function allow(address _user) external {
        permissoes[msg.sender][_user] = true;

        if (dadoAnterior[msg.sender][_user]) {
            for (uint i = 0; i < listaDeAcesso[msg.sender].length; i++) {
                if (listaDeAcesso[msg.sender][i].user == _user) {
                    listaDeAcesso[msg.sender][i].acess = true;
                }
            }
        } else {
            listaDeAcesso[msg.sender].push(Acesso(_user, true));
            dadoAnterior[msg.sender][_user] = true;
        }
    }

    // Função para negar acesso a todos os arquivos do usuário
    function disallow(address _user) external {
        require(permissoes[msg.sender][_user], "O usuario nao tem acesso a este arquivo.");

        permissoes[msg.sender][_user] = false;

        for (uint i = 0; i < listaDeAcesso[msg.sender].length; i++) {
            if (listaDeAcesso[msg.sender][i].user == _user) {
                listaDeAcesso[msg.sender][i].acess = false;
            }
        }
    }

    // Função para exibir a lista de CIDs dos arquivos que um usuário tem acesso
    function display(address _user) external view returns (string[] memory) {
        require(_user == msg.sender || permissoes[_user][msg.sender], "Voce nao tem acesso");

        return valor[_user];
    }

    // Função para exibir a lista de acessos concedidos pelo usuário
    function getAccessList(address _user) external view returns (Acesso[] memory) {
        require(_user == msg.sender || permissoes[_user][msg.sender], "Voce nao tem acesso a esta lista.");
        return listaDeAcesso[_user];
    }


    // Função para verificar quais arquivos foram compartilhados com o usuário
    function getFilesSharedWithMe() external view returns (string[] memory) {
        uint count = 0;
        
        // Conta quantos arquivos foram compartilhados com o endereço atual
        for (uint i = 0; i < listaDeAcesso[msg.sender].length; i++) {
            if (listaDeAcesso[msg.sender][i].acess) {
                count++;
            }
        }
        
        // Cria um array para armazenar os arquivos compartilhados
        string[] memory sharedFiles = new string[](count);
        uint index = 0;
        
        // Preenche o array com os arquivos compartilhados
        for (uint i = 0; i < listaDeAcesso[msg.sender].length; i++) {
            if (listaDeAcesso[msg.sender][i].acess) {
                address owner = listaDeAcesso[msg.sender][i].user;
                string[] storage ownerFiles = valor[owner];
                for (uint j = 0; j < ownerFiles.length; j++) {
                    sharedFiles[index] = ownerFiles[j];
                    index++;
                }
            }
        }
        
        return sharedFiles;
    }

}
