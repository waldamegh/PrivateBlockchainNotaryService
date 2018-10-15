/* ===== LevelDB ===============================
|  Learn more: LevelDB: https://github.com/Level/level    |
|  =========================================================*/

const levelSandbox = require('./levelSandbox.js');

/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');


/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/

class Block{
	constructor(data){
     this.hash = "",
     this.height = 0,
     this.body = data,
     this.time = 0,
     this.previousBlockHash = ""
    }
}

/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

class Blockchain{
    
  constructor(){
     
    let self = this;
	// create Genesis Block if not exist
	levelSandbox.getLevelDBData(0).then( function(block) {
		//Genesis Block is exist
		//console.log('Blockchain Genesis Block is :');
		//console.log(block);
        
	}).catch(function (message) {
		//Genesis Block is not exist
		if (message === 'Not found!'){
            // add a Genesis block
			console.log('Creating Genesis Block ...');
            //set block body
            let blockBody = {
                address: "0",
                star: { ra: "0", dec: "0", story: " " }
            };
			self.addBlock(new Block(blockBody)).then( function(block){
                    console.log(JSON.stringify(block));
            }).catch(function(messsage){
                console.log(messsage);
            });
		}else{
			console.log(message);
		}
	});
      
	
  }

  // Add new block
  async addBlock(newBlock){
    let self = this;
      return await new Promise(function(resolve, reject) {
		//Get last Block in the chain
        self.getBlockHeight().then(function (height) {
            //console.log(height);
                if (height > -1) { 
                    levelSandbox.getLevelDBData(height).then(function(block) {
                        //console.log(block);
                        // Block height
                        if (block === undefined){
                            newBlock.height = 0;
                        }else {
                            newBlock.height = (block.height)+1;
                        }
                        // UTC timestamp
                        newBlock.time = new Date().getTime().toString().slice(0,-3);
                        // previous block hash
                        if(newBlock.height > 0){
                            newBlock.previousBlockHash = block.hash;
                        }
                        // Block hash with SHA256 using newBlock and converting to a string
                        newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
                        // Adding block object to chain
                        console.log('Adding a new block ...');
                        levelSandbox.addLevelDBData(newBlock.height, JSON.stringify(newBlock));
                        resolve(newBlock);
                        
                    }).catch(function (message) {
                        console.log(message);
                        reject({'error': message});
                    });
                }else{
                    newBlock.height = 0;
                    // UTC timestamp
                    newBlock.time = new Date().getTime().toString().slice(0,-3);
                    // Block hash with SHA256 using newBlock and converting to a string
                    newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
                    // Adding block object to chain
                    console.log('Adding a new block ...');
                    levelSandbox.addLevelDBData(newBlock.height, JSON.stringify(newBlock));
                    resolve(newBlock);
                }
            }).catch(function (message) {
			console.log(message);
            reject({'error': message});
		});
      });
      
	
  }

    
  // Get block height
  getBlockHeight(){
		//Get last Block in the chain
		return new Promise(function(resolve, reject) {
           //Get last Block in the chain
		levelSandbox.getAllData().then(function(chain) {
			// Blockchain height
			if (chain === undefined){
				console.log('Block Height is: 0' );
                resolve(-1);
			}else {
				console.log('Block Height is: ' + (chain-1));
                resolve((chain-1));
			}
		}).catch(function (message) {
			console.log(message);
            reject({'error': message});
		});
		
    });
      
      
  }

    //get block by blockchain ID (address)
    async getBlockByAddress(address){
        let blocks = [] ; 
        return await new Promise(function(resolve, reject) {
            levelSandbox.getData().then( function(chain) {
                if(chain.length>0){
                    for (var i = 0; i < (chain.length); i++) {
                        console.log(address);
                        console.log(i+ ')   '+chain[i].body.address);
                        if (chain[i].body.address === address){
                            console.log('found!!');
                           blocks.push(chain[i]);
                        }
                    }
                    if (blocks.length >0){
                        //console.log('Blocks'+ JSON.stringify(blocks));
                        resolve(blocks);
                    } else{
                        reject({'error': 'invalid address'});
                    }
                } else{
                    reject({'error': 'Blockchain is empty'});
                }
                
            }).catch(function (message) {
                console.log(message);
                reject({'error': message});
            });
    });
        
    }
    //get block by block hash
    async getBlockByHash(hash){
        
        return await new Promise(function(resolve, reject) {
            levelSandbox.getData().then( function(chain) {
                if(chain.length>0){
                    for (var i = 0; i < (chain.length); i++) {
                        if (chain[i].hash === hash){
                            console.log('done!!');
                            resolve(chain[i]);
                        }
                    }
                    reject({'error': 'hash not found!'});
                } else{
                    reject({'error': 'chain empty'});
                }
                
            }).catch(function (message) {
                console.log(message);
                reject({'error': message});
            });
    });
}
    
    
    
    // get block
    async getBlock(blockHeight){
		//get block
		return await new Promise(function(resolve, reject) {
            levelSandbox.getLevelDBData(blockHeight).then( function(block) {
                //block info
                console.log('Block Number ('+ blockHeight + '):\n' + JSON.stringify(block));
                resolve(block);
            }).catch(function (message) {
                console.log(message);
                reject({'error': message});
            });
    });
                           
                           
}
     
    // validate block
    validateBlock(blockHeight){
		
		//get block
		levelSandbox.getLevelDBData(blockHeight).then( function(block) {
			//get block hash
			let blockHash = block.hash;
			// remove block hash to test block integrity
			block.hash = '';
			// generate block hash
			let validBlockHash = SHA256(JSON.stringify(block)).toString();
			// Compare
			if (blockHash === validBlockHash) {
				console.log('Block #' + blockHeight + ' is valid block');
			} else {
				console.log('Block #'+blockHeight+' invalid hash:\n'+blockHash+'<>'+validBlockHash);
				console.log(false);
			}
		}).catch(function (message) {
			console.log(message);
		});
    }
	

    
   // Validate blockchain
    validateChain(){let self= this;
		let errorLog = [];
		//Get All Blocks in the chain
		levelSandbox.getAllData().then(function(chain) {
			// Blockchain length
			if (chain === undefined){
				console.log('chain is empty' );
			}else {
				for (var i = 0; i < (chain-1); i++) {
					// compare blocks hash link
					let blockHash = '';
					let previousHash ='';
                    self.getBlock(i).then(block =>{
                        blockHash = block.hash;
                    });
                    self.getBlock(i+1).then(block =>{
                        previousHash = block.previousBlockHash;
                        if (blockHash !== previousHash) {
						  errorLog.push(i);
					   }
                    });
					
				}
				if (errorLog.length>0) {
					console.log('Block errors = ' + errorLog.length);
					console.log('Blocks: '+errorLog);
				}else{
					console.log('No errors detected');
				}
			}
		}).catch(function (message) {
			console.log(message);
		});
	}


}

module.exports.Blockchain = Blockchain;
module.exports.Block = Block; 

/*==============Test====================*/


//var blockchain = new Blockchain();
//blockchain.addBlock(new Block('Test 15'));
//blockchain.getBlockHeight();
//blockchain.getBlock(14);

//blockchain.validateBlock(0);
//blockchain.validateChain();