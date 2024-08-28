# CloudBlock

# Ferramentas
- VSCode 
- Pinata (API KEY e SECRET API KEY)
- MetaMask
- Ganache
- Truffle
- Web3.js

Instale as ferramentas necessárias:
![image](https://github.com/user-attachments/assets/5163ba54-9acc-4dc6-a114-d7fb75c05296)

Após isso, em um terminal:
- ganache
  
![image](https://github.com/user-attachments/assets/3c7ca3ad-4669-4259-becd-cf9a09d97b74)

Armazene as privates keys geradas, elas serão necessárias para importar na sua carteira no MetaMask

Em outro terminal
- truffle compile
- truffle migrate --network development
  
![image](https://github.com/user-attachments/assets/5a4e80f9-df3c-4b39-9872-e2d53b3f74d4)

Copie e cole o endereço do contrato na variavel contractAdress no ../ script.js

No arquivo ..build/contracts/Upload.json copie o valor que está presente no "abi = [ ...... ]" copie somente o que está entre as chaves.

Cole na variável contractABI no ../script.js

![image](https://github.com/user-attachments/assets/cb03c901-b9df-4f5a-b653-1d679c01c50d)

Clique no index.html com o botão direito do mouse e selecione "Open with Live Server" --instale a extensão Live Server no VSCode

Agora ao conectar na Metamask, importe as Private Keys geradas no terminal onde executou o ganache

