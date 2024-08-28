let web3;
let contract;
let accounts;

const contractABI = //ABI do contrato [ ];
const contractAddress = //Endereco do contrato gerado apos o truffle migrate;

document.getElementById('connectButton').addEventListener('click', connectWallet);
document.getElementById('uploadButton').addEventListener('click', uploadFile);
document.getElementById('shareButton').addEventListener('click', shareAccess);
document.getElementById('getAccessListButton').addEventListener('click', getAccessList);
document.getElementById('viewFilesButton').addEventListener('click', viewFiles);
document.getElementById('disallowButton').addEventListener('click', disallowFile);
document.getElementById('viewSharedFilesButton').addEventListener('click', viewSharedFiles);

async function connectWallet() {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        try {
            accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            contract = new web3.eth.Contract(contractABI, contractAddress);
            document.getElementById('connectConta').textContent = accounts[0];
            viewFiles();
        } catch (error) {
            console.error('Erro ao conectar carteira:', error);
        }
    } else {
        alert('MetaMask não encontrado! Por favor, instale o MetaMask.');
    }
}

async function uploadToPinata(file) {
  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

  // Criando um FormData para enviar o arquivo para o Pinata
  let data = new FormData();
  data.append('file', file);

  try {
      const res = await axios.post(url, data, {
          maxContentLength: 'Infinity', // Definido para lidar com arquivos grandes
          headers: {
              'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
              'pinata_api_key': //'',
              'pinata_secret_api_key': //''
          }
      });
      return res.data;
  } catch (error) {
      console.error('Erro ao fazer upload para o Pinata:', error);
  }
}

// upload arquivo - add
async function uploadFile() {
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];
  if (file) {
      try {
          const pinataResponse = await uploadToPinata(file);
          const ipfsHash = pinataResponse.IpfsHash;
          await contract.methods.add(ipfsHash).send({ from: accounts[0] });
          alert(`Arquivo "${file.name}" carregado com sucesso! Hash: ${ipfsHash}`);
          viewFiles(); // Atualiza os seletores de arquivos
      } catch (error) {
          console.error('Erro ao fazer upload do arquivo:', error);
      }
  } else {
      alert('Selecione um arquivo para fazer o upload.');
  }
}

// compartilhar acesso - allow
async function shareAccess() {
  const fileSelect = document.getElementById('fileSelect');
  const walletAddress = document.getElementById('walletAddress').value;

  const selectedFileCID = fileSelect.value; // Obtém o valor selecionado (CID)
  
  if (selectedFileCID && walletAddress) {
      try {
          await contract.methods.allow(walletAddress, selectedFileCID).send({ from: accounts[0] });
          alert('Acesso compartilhado com sucesso!');
      } catch (error) {
          console.error('Erro ao compartilhar o acesso:', error);
      }
  } else {
      alert('Por favor, selecione um arquivo e insira um endereço de carteira.');
  }
}

// negar acesso - disallow
async function disallowFile(userAddress) {
  try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];

      await contract.methods.disallow(userAddress).send({ from: account });

      console.log(`Acesso do usuário ${userAddress} foi revogado.`);
  } catch (error) {
      console.error('Erro ao revogar acesso ao arquivo:', error);
  }
}

// visualizar arquivos - display
async function viewFiles() {
  const accountAddress = document.getElementById('connectConta').textContent;
  try {
      const files = await contract.methods.display( accountAddress).call({ from:  accountAddress });
      const ul = document.getElementById('fileList');
      ul.innerHTML = '';

      const fileSelect = document.getElementById('fileSelect');
      const fileSelectDisallow = document.getElementById('fileSelectDisallow');
        // Limpar a lista de arquivos e seletores
      ul.innerHTML = '';
      fileSelect.innerHTML = '<option value="">Selecione um arquivo</option>';
      fileSelectDisallow.innerHTML = '<option value="">Selecione um arquivo</option>';

      files.forEach(file => {
          const li = document.createElement('li');
          li.innerHTML = `<a href="https://gateway.pinata.cloud/ipfs/${file}" target="_blank">${file}</a>`;
          ul.appendChild(li);
          // Atualizar opções dos seletores
          const option = document.createElement('option');
          option.value = file;
          option.textContent = file;
          fileSelect.appendChild(option);
          const disallowOption = document.createElement('option');
          disallowOption.value = file;
          disallowOption.textContent = file;
          fileSelectDisallow.appendChild(disallowOption);
      });        
  } catch (error) {
      console.error('Erro ao visualizar arquivos:', error);
  }
}

// lista de acesso - getAccessList/shareAccess
async function getAccessList() {
  const address = document.getElementById('accessListAddress').value;

  try {
      const accessList = await contract.methods.getAccessList(address).call({ from: accounts[0] });
      const ul = document.getElementById('accessList');
      ul.innerHTML = '';
      
      if (accessList.length === 0) {
          ul.innerHTML = '<li>Nenhum acesso encontrado.</li>';
          return;
      }

      accessList.forEach(entry => {
          const li = document.createElement('li');
          li.innerHTML = `Usuário: ${entry.user}, Acesso: ${entry.acess}`;
          ul.appendChild(li);
      });
  } catch (error) {
      console.error('Erro ao visualizar a lista de acessos:', error);
  }
}

/*async function updateFileSelectOptions() {
  try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];

      // Chama a função display do contrato
      const files = await contract.methods.display(account).call({ from: account });

      const fileSelect = document.getElementById('fileSelect');
      fileSelect.innerHTML = ''; // Limpa as opções atuais

      files.forEach(file => {
          const option = document.createElement('option');
          option.value = file;
          option.textContent = file;
          fileSelect.appendChild(option);
      });
  } catch (error) {
      console.error('Erro ao atualizar opções de seleção de arquivos:', error);
  }
}*/

// ver arquivos compartilhados com conta - getFilesSharedWithMe
async function viewSharedFiles() {
  try {
      const files = await contract.methods.getFilesSharedWithMe().call({ from: accounts[0] });
      const ul = document.getElementById('sharedFileList');
      ul.innerHTML = '';
      
      if (files.length === 0) {
          ul.innerHTML = '<li>Nenhum arquivo compartilhado com você.</li>';
          return;
      }
      
      files.forEach(file => {
          const li = document.createElement('li');
          li.innerHTML = `<a href="https://gateway.pinata.cloud/ipfs/${file}" target="_blank">${file}</a>`;
          ul.appendChild(li);
      });
  } catch (error) {
      console.error('Erro ao visualizar arquivos compartilhados:', error);
  }
}




