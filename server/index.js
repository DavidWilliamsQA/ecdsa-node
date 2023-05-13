const secp = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { utf8ToBytes } = require("ethereum-cryptography/utils");

const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "0286152c3175b3b9846d346794177e8e839bded28e78028cdf080970e4210386ce": 100,
  "0331df3f36cb8d79b5217759407a3feaa97aa61f5dcd7be1421e12866ba5651d49": 50,
  "03606724b2a717ef2961f239f57580f309ca26d778de2c29bc77f15037db192f0f": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  // TODO: get a signature from client-side application
  // recover the public key from the signature
  // that will become the senders address

  const { recipient, amount, sender, signature } = req.body;

  const messageHash = keccak256(utf8ToBytes(sender));
  const bigSignature = JSON.parse(signature, (key, value) => {
    if (typeof value === "string") {
      return BigInt(value);
    }
    return value;
  });

  const isValid = secp.secp256k1.verify(bigSignature, messageHash, sender);

  if (!isValid) {
    res
      .status(400)
      .send({ message: "You are not authorised to make this transaction" });
  } else {
    setInitialBalance(sender);
    setInitialBalance(recipient);

    if (balances[sender] < amount) {
      res.status(400).send({ message: "Not enough funds!" });
    } else {
      balances[sender] -= amount;
      balances[recipient] += amount;
      res.send({ balance: balances[sender] });
    }
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
