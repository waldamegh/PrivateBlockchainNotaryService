# Private Blockchain Notary Service with Express.js API

This project illustrates a simple example of private blockchain notary service stored in LevelDB and interacted with it through a web server API (Express framework)

## RESTful web API (Express.js framework)

The app.js file has seven endpoints:

1) Get a wellcoming message
```
app.get('/', (req, res) => {...});
```

2) Get a block by block height
```
app.get('/block/:blockHeight', (req, res) => {...});
```

3) Get a block by block hash
```
app.get('/stars/hash::hash', (req, res) => {...});
```
4) Get a block by block address
```
app.get('/stars/address::address', (req, res) => {...});
```
5) Post a new block
```
app.post('/block', (req, res) => {...});
```
5) Post a request validation
```
app.post('/requestValidation', (req, res) => {...});
```
5) Post a message signature validation 
```
app.post('/message-signature/validate', (req, res) => {...});
```

## Installation

- NPM required to initialize project and create package.json to store project dependencies.
```
npm init
```
- Install crypto-js with --save flag to save dependency to our package.json file
```
npm install crypto-js --save
```
- Install level with --save flag
```
npm install level --save
```
- Install Express.js as the webserver framework
```
npm install express
```
- Install Joi to handle incorrect inputs
```
npm install joi
```
- Install bitcoinjs-lib
```
npm install bitcoinjs-message --save
```
- Install bitcoinjs-message
```
npm install bitcoinjs-message --save

```


## How to run?
In the terminal run app.js file
```
node app.js
```



## Testing Functions

### 1.Blockchain ID Validation:

***Validate User Request***
```
http://localhost:8000/requestValidation
```
- Request:

```
curl -X "POST" "http://localhost:8000/requestValidation" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -d $'{
  "address": "1HZwkjkeaoZfTSaJxDw6aKkxp45agDiEzN"
  }'
```
- Response:
```
{
    "address": "1HZwkjkeaoZfTSaJxDw6aKkxp45agDiEzN",
    "requestTimeStamp": 1539636383,
    "message": "1HZwkjkeaoZfTSaJxDw6aKkxp45agDiEzN:1539636383:starRegistry",
    "validationWindow": 300
}
```


***Allow User Message Signature*** 
```
http://localhost:8000/message-signature/validate
```
- Request:

```
curl -X "POST" "http://localhost:8000/message-signature/validate" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -d $'{
  "address":"1HZwkjkeaoZfTSaJxDw6aKkxp45agDiEzN",
  "signature":"HOaAW49PgTxN7b79Zr9wyyOGfAJMUwIJ7PVSDDO2CuhsJx25wsMdcCrgMUHXUoiuqrsOeQk4gKrbTfEHUUAXcfk="
}'
```
- Response:
```
{
    "registerStar": true,
    "status": {
        "address": "1HZwkjkeaoZfTSaJxDw6aKkxp45agDiEzN",
        "requestTimeStamp": 1539636383,
        "message": "1HZwkjkeaoZfTSaJxDw6aKkxp45agDiEzN:1539636383:starRegistry",
        "validationWindow": 239,
        "messageSignature": "valid"
    }
}
```

### 2.Configure Star Registration Endpoint:

***Add Star***
```
http://localhost:8000/block
```
- Request:

```
curl -X "POST" "http://localhost:8000/block" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -d $'{
  "address": "1HZwkjkeaoZfTSaJxDw6aKkxp45agDiEzN",
  "star": {
  	"ra": "16h 29m 1.0s",
    "dec": "-26° 29' 24.9",
    "story": "Found star using https://www.google.com/sky/"
  }
}'
```
- Response:
```
{
    "hash": "2984e1c09876320cda3800c0f77c09f93ef76f679270bbfed4f4f2c09f98b0ac",
    "height": 4,
    "body": {
        "address": "1HZwkjkeaoZfTSaJxDw6aKkxp45agDiEzN",
        "star": {
            "ra": "16h 29m 1.0s",
            "dec": "-26° 29' 24.9",
            "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f"
        }
    },
    "time": "1539637780",
    "previousBlockHash": "197955e1702c324995c496b0294adea7cd003ba6ac196d8e42893a44a7575779"
}
```


### 3.Star Lookup:

***Lookup by Blockchain ID (Wallet Address)***
```
http://localhost:8000/stars/address:[address]
```
- Request:

```
curl "http://localhost:8000/stars/address:1HZwkjkeaoZfTSaJxDw6aKkxp45agDiEzN"
```
- Response:
```
[
    {
        "hash": "86ef00f6611ac29aff6252ea9b08f9cd1107b2f8d0d9858bc0f873465848b0e0",
        "height": 1,
        "body": {
            "address": "1HZwkjkeaoZfTSaJxDw6aKkxp45agDiEzN",
            "star": {
                "ra": "16h 29m 1.0s",
                "dec": "-26° 29' 24.9",
                "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
                "storyDecoded": "Found star using https://www.google.com/sky/"
            }
        },
        "time": "1539635166",
        "previousBlockHash": "bfd448f4c05129939868675cb5e36baea72de22d1a6d1ef1fa344559d9dbcafd"
    },
    {
        "hash": "2984e1c09876320cda3800c0f77c09f93ef76f679270bbfed4f4f2c09f98b0ac",
        "height": 4,
        "body": {
            "address": "1HZwkjkeaoZfTSaJxDw6aKkxp45agDiEzN",
            "star": {
                "ra": "16h 29m 1.0s",
                "dec": "-26° 29' 24.9",
                "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
                "storyDecoded": "Found star using https://www.google.com/sky/"
            }
        },
        "time": "1539637780",
        "previousBlockHash": "197955e1702c324995c496b0294adea7cd003ba6ac196d8e42893a44a7575779"
]
```


***Lookup by Block Hash***
```
http://localhost:8000/stars/hash:[hash]
```
- Request:

```
curl "http://localhost:8000/stars/hash:86ef00f6611ac29aff6252ea9b08f9cd1107b2f8d0d9858bc0f873465848b0e0"
```
- Response:
```
{
    "hash": "86ef00f6611ac29aff6252ea9b08f9cd1107b2f8d0d9858bc0f873465848b0e0",
    "height": 1,
    "body": {
        "address": "1HZwkjkeaoZfTSaJxDw6aKkxp45agDiEzN",
        "star": {
            "ra": "16h 29m 1.0s",
            "dec": "-26° 29' 24.9",
            "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
            "storyDecoded": "Found star using https://www.google.com/sky/"
        }
    },
    "time": "1539635166",
    "previousBlockHash": "bfd448f4c05129939868675cb5e36baea72de22d1a6d1ef1fa344559d9dbcafd"
}
```


***Lookup by Block Height***

```
http://localhost:8000/block/[blockHeight]
```
- Request:

```
curl "http://localhost:8000/block/1"
```
- Response:
```
{
    "hash": "86ef00f6611ac29aff6252ea9b08f9cd1107b2f8d0d9858bc0f873465848b0e0",
    "height": 1,
    "body": {
        "address": "1HZwkjkeaoZfTSaJxDw6aKkxp45agDiEzN",
        "star": {
            "ra": "16h 29m 1.0s",
            "dec": "-26° 29' 24.9",
            "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
            "storyDecoded": "Found star using https://www.google.com/sky/"
        }
    },
    "time": "1539635166",
    "previousBlockHash": "bfd448f4c05129939868675cb5e36baea72de22d1a6d1ef1fa344559d9dbcafd"
}
```
