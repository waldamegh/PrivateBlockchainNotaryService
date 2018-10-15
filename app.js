/* ===== Express =================================================================
|  Learn more: Express: http://expressjs.com/                                     |
|  ==============================================================================*/
const express = require('express');
const app = express();
app.use(express.json());

/* ===== Joi =====================================================================
|  Learn more: Joi: https://github.com/hapijs/joi                                 |
|  ==============================================================================*/
const Joi = require('joi');

/* ===== bitcoinjs-lib ===========================================================
|  Learn more: bitcoinjs-lib: https://github.com/bitcoinjs/bitcoinjs-lib          |
|  ==============================================================================*/
const bitcoinLib = require('bitcoinjs-lib');

/* ===== bitcoinjs-message =======================================================
|  Learn more: bitcoinjs-message: https://github.com/bitcoinjs/bitcoinjs-message  |
|  ==============================================================================*/
const bitcoinMsg = require('bitcoinjs-message');


//create blockchain object
const {Block,Blockchain} = require('./simpleChain');
const blockchain = new Blockchain();

//Set blockchain height to the cuurent height in LevelDB
let chainHeight = 0;
blockchain.getBlockHeight().then(height => {
   if (height >0){
       chainHeight = height;
   } 
});

//set star registration variables
let TXPool = [];
let allowStarRegistration = [];
const delay = 300;


// Server lisitening on port 8000
const port = 8000
app.listen(port, () => console.log(`Blockchain API listening on port ${port}...`));




/*------ HTTP GET Request -------------------------------------
| URL = '/'                                                    |
| response with a welcome message                              |    
|_____________________________________________________________*/
app.get('/', (req, res) => {
    res.send('Welcome to the Private Blockcahain API.');
});


/*------ HTTP GET Request -------------------------------------
| URL = '/block/{blockHeight}'                                 |
| response with the block details                              |
|_____________________________________________________________*/
app.get('/block/:blockHeight', (req, res) => {
     
    //handling incorrect params through Joi
    const schema = { blockHeight: Joi.number().integer().min(0).max(chainHeight).required() };
    const { error } = Joi.validate(req.params, schema);
    if (error) return res.status(400).send(error.details[0].message);

    //getting the requested block info
    blockchain.getBlock(req.params.blockHeight).then(block => {
        //Decode star story from ASCII to string
        if (block.body.star.story !== undefined) {
            block.body.star.storyDecoded = Buffer.from(block.body.star.story, 'hex').toString('ascii');
        }
        
        console.log(block);
        res.send(block);
        
    }).catch(err => {
            console.log(err);
            res.send(err);
    });
   
});

/*------ HTTP GET Request -------------------------------------
| URL = '/stars/hash:{hash}'                                   |
| response with the block details                              |
|_____________________________________________________________*/
app.get('/stars/hash::hash', (req, res) => {
    //handling incorrect params through Joi
    const schema = { hash: Joi.string().min(1).required() };
    const { error } = Joi.validate(req.params, schema);
    if (error) return res.status(400).send(error.details[0].message);

    //getting the requested block info
    blockchain.getBlockByHash(req.params.hash).then(block => {
        //Decode star story from ASCII to string
        if (block.body.star.story !== undefined) {
            block.body.star.storyDecoded = Buffer.from(block.body.star.story, 'hex').toString('ascii');
        }
        
        console.log(block);
        res.send(block);
        
    }).catch(err => {
            console.log(err);
            res.send(err);
    });
    
});

/*------ HTTP GET Request -------------------------------------
| URL = '/stars/address:{address}'                             |
| response with the block details                              |
|_____________________________________________________________*/
app.get('/stars/address::address', (req, res) => {
    //handling incorrect input through Joi
    const schema = { address: Joi.string().min(1).required() };
    const { error } = Joi.validate(req.params, schema);
    if (error) return res.status(400).send(error.details[0].message);

    //getting the requested block info
    blockchain.getBlockByAddress(req.params.address).then(blocks => {
        //Decode star story from ASCII to string
        for (var i = 0; i < (blocks.length); i++) {
            if (blocks[i].body.star.story !== undefined) {
                blocks[i].body.star.storyDecoded = Buffer.from(blocks[i].body.star.story, 'hex').toString('ascii');
            }
        }
        
        console.log(blocks);
        res.send(blocks);
        
    }).catch(err => {
            console.log(err);
            res.send(err);
    });
    
});


/*------ HTTP Post Request ------------------------------------
| URL = '/block'                                               |
| response with new block details                              |
|_____________________________________________________________*/
app.post('/block', (req, res) => {
    //handling incorrect input through Joi
    const starSchema = Joi.object({ ra: Joi.string().required(), dec: Joi.string().required(), story: Joi.string().min(1).max(500).required()});
    const schema = { address: Joi.string().required(), star: starSchema };
    const { error } = Joi.validate(req.body, schema);
    if (error) return res.status(400).send(error.details[0].message);

    //check identity registration 
    if (TXPool[req.body.address] === undefined) {
        return res.status(400).json({"error" : "Address is not registred! Please request a message from (/requestValidation)" });
    }
    
    //check authoriztion of registering star
    if (allowStarRegistration[req.body.address] === undefined) {
        return res.status(400).json({ "error" : "Not autorized! Please sign a message from (/message-signature/validate)" });
    }
    
    //Encode star story to ASCII
    req.body.star.story = Buffer.from(req.body.star.story, 'ascii').toString('hex');
    
    //Add Block
    async function addBlock(body) {
        //adding new block
        return await blockchain.addBlock(new Block(body));
        
    }

    addBlock(req.body).then(block => { 
            //update chain height
            chainHeight = block.height;
            
            console.log('Done');
            console.log(block);
        
            //remove identity
            delete TXPool[req.body.address];
            delete allowStarRegistration[req.body.address];
            
            res.send(block);
        
        }).catch(err => {
            console.log(err);
            res.send(err);
        });
    
});


/*------ HTTP Post Request ------------------------------------
| URL = '/requestValidation'                                   |
| response with request details                                |
|_____________________________________________________________*/
app.post('/requestValidation', (req, res) => {
    //handling incorrect input through Joi
    const schema = { address: Joi.string().required() };
    const { error } = Joi.validate(req.body, schema);
    if (error) return res.status(400).send(error.details[0].message);
    
    let address = req.body.address;
    let currentTime = Math.round(+new Date / 1000);
    
    //store addresses in TXPool for the specified delay time
    if (!TXPool[address] || ((TXPool[address] + delay) < currentTime)) {
        TXPool[address] = currentTime;
        setTimeout(() => {
            delete TXPool[address];
            delete allowStarRegistration[address];
        }, delay * 1000);
    }
    
    let response = {
        address: address,
        requestTimeStamp: TXPool[address],
        message: `${address}:${TXPool[address]}:starRegistry`,
        validationWindow: TXPool[address] + delay - currentTime
    }
    
    console.log(TXPool);
    res.send(response);
});


/*------ HTTP Post Request ------------------------------------
| URL = '/message-signature/validate'                          |
| response with message signature request detail               |
|_____________________________________________________________*/
app.post('/message-signature/validate', (req, res) => {
    //handling incorrect input through Joi
    const schema = { address: Joi.string().required(), signature: Joi.string().required() };
    const { error } = Joi.validate(req.body, schema);
    if (error) return res.status(400).send(error.details[0].message);
    
    
    let address = req.body.address;
    let signature = req.body.signature;
    let timestamp = TXPool[address];
    
    //check time
    if (timestamp === undefined) {
        res.json({ registerStar: false, error: 'Sorry timeout! Please request validation message again from (/requestValidation)'});
        return null;
    }
    
    
    const Message = `${address}:${TXPool[address]}:starRegistry`;
    let isValid = false;
    let response = null;
    let error_mesg = null;
    
    //check message signature
    try{
        isValid = bitcoinMsg.verify(Message,address,signature);
        if (!isValid){error_mesg = 'Invalid signature!';}
    } catch(err){
        error_mesg = err.message;
        console.log(err);
    }

    if (isValid) {
        let validationWindow = timestamp + delay - Math.round(+new Date/1000);
        allowStarRegistration[address] = true;
        
        response = {
            registerStar: true,
            status: {
                address: address,
                requestTimeStamp: timestamp,
                message: Message,
                validationWindow: validationWindow,
                messageSignature: 'valid'
            }
        };
    } else {
        response = { registerStar: false, error: error_mesg};
    }
    
    res.send(response);
});
