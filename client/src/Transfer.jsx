import { useState } from "react";
import server from "./server";
import { utf8ToBytes } from "ethereum-cryptography/utils";
import { keccak256 } from "ethereum-cryptography/keccak";
import * as secp from "ethereum-cryptography/secp256k1";

function Transfer({ address, privateKey, setBalance }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  // const [signature, setSignature] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  function signMessage(message) {
    return secp.secp256k1.sign(message, privateKey);
  }

  function hashMessage(message) {
    return keccak256(utf8ToBytes(message));
  }

  async function transfer(evt) {
    evt.preventDefault();

    const message = {
      amount: parseInt(sendAmount),
      recipient,
    };

    const messageHash = hashMessage(address);

    const { r, s } = signMessage(messageHash);

    const signature = JSON.stringify({
      r: r.toString(),
      s: s.toString(),
    });

    try {
      console.log(signature);
      console.log(recipient);

      const {
        data: { balance },
      } = await server.post(`send`, {
        signature,
        amount: parseInt(sendAmount),
        recipient,
        sender: address,
      });
      setBalance(balance);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
