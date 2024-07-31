export const ZoraAbi = [
    {
        "inputs": [
            { "internalType": "string", "name": "name", "type": "string" },
            { "internalType": "string", "name": "symbol", "type": "string" },
            { "internalType": "address", "name": "defaultAdmin", "type": "address" },
            { "internalType": "uint64", "name": "editionSize", "type": "uint64" },
            { "internalType": "uint16", "name": "royaltyBPS", "type": "uint16" },
            { "internalType": "address payable", "name": "fundsRecipient", "type": "address" },
            { "internalType": "bytes[]", "name": "setupCalls", "type": "bytes[]" },
            { "internalType": "contract IMetadataRenderer", "name": "metadataRenderer", "type": "address" },
            { "internalType": "bytes", "name": "metadataInitializer", "type": "bytes" },
            { "internalType": "address", "name": "createReferral", "type": "address" }
        ],
        "name": "createEditionWithReferral",
        "outputs": [
            { "internalType": "address payable", "name": "newDropAddress", "type": "address" }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "recipient",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "quantity",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "comment",
                "type": "string"
            },
            {
                "internalType": "address",
                "name": "mintReferral",
                "type": "address"
            }
        ],
        "name": "mintWithRewards",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    }
] as const;
