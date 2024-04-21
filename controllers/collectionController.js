const NftContractInteraction = require("../contract");

const createNft = async (req, res) => {
  console.log('dddddddddddd');
  const { address, tokenUri, provider } = req.body;
  const data = await NftContractInteraction.createNft(
    address,
    Math.floor(new Date().getTime() / 1000),
    tokenUri,
    provider
  );
  return res.status(201).send({ msg: "NFT create Success", data: data });
};

const getAllCollection = async (req, res) => {
  return res.status(201).send({ msg: "NFT Success" });
};

module.exports = { createNft, getAllCollection };
