export const ZoraAbi = [
        [
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "_implementation",
                  "type": "address"
                },
                {
                  "internalType": "contract EditionMetadataRenderer",
                  "name": "_editionMetadataRenderer",
                  "type": "address"
                },
                {
                  "internalType": "contract DropMetadataRenderer",
                  "name": "_dropMetadataRenderer",
                  "type": "address"
                }
              ],
              "stateMutability": "nonpayable",
              "type": "constructor"
            },
            {
              "inputs": [],
              "name": "initialize",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "contractName",
              "outputs": [
                {
                  "internalType": "string",
                  "name": "",
                  "type": "string"
                }
              ],
              "stateMutability": "pure",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "contractURI",
              "outputs": [
                {
                  "internalType": "string",
                  "name": "",
                  "type": "string"
                }
              ],
              "stateMutability": "pure",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "string",
                  "name": "name",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "symbol",
                  "type": "string"
                },
                {
                  "internalType": "address",
                  "name": "defaultAdmin",
                  "type": "address"
                },
                {
                  "internalType": "uint64",
                  "name": "editionSize",
                  "type": "uint64"
                },
                {
                  "internalType": "uint16",
                  "name": "royaltyBPS",
                  "type": "uint16"
                },
                {
                  "internalType": "address payable",
                  "name": "fundsRecipient",
                  "type": "address"
                },
                {
                  "internalType": "bytes[]",
                  "name": "setupCalls",
                  "type": "bytes[]"
                },
                {
                  "internalType": "contract IMetadataRenderer",
                  "name": "metadataRenderer",
                  "type": "address"
                },
                {
                  "internalType": "bytes",
                  "name": "metadataInitializer",
                  "type": "bytes"
                },
                {
                  "internalType": "address",
                  "name": "createReferral",
                  "type": "address"
                }
              ],
              "name": "createAndConfigureDrop",
              "outputs": [
                {
                  "internalType": "address payable",
                  "name": "newDropAddress",
                  "type": "address"
                }
              ],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "string",
                  "name": "name",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "symbol",
                  "type": "string"
                },
                {
                  "internalType": "address",
                  "name": "defaultAdmin",
                  "type": "address"
                },
                {
                  "internalType": "uint64",
                  "name": "editionSize",
                  "type": "uint64"
                },
                {
                  "internalType": "uint16",
                  "name": "royaltyBPS",
                  "type": "uint16"
                },
                {
                  "internalType": "address payable",
                  "name": "fundsRecipient",
                  "type": "address"
                },
                {
                  "components": [
                    {
                      "internalType": "uint104",
                      "name": "publicSalePrice",
                      "type": "uint104"
                    },
                    {
                      "internalType": "uint32",
                      "name": "maxSalePurchasePerAddress",
                      "type": "uint32"
                    },
                    {
                      "internalType": "uint64",
                      "name": "publicSaleStart",
                      "type": "uint64"
                    },
                    {
                      "internalType": "uint64",
                      "name": "publicSaleEnd",
                      "type": "uint64"
                    },
                    {
                      "internalType": "uint64",
                      "name": "presaleStart",
                      "type": "uint64"
                    },
                    {
                      "internalType": "uint64",
                      "name": "presaleEnd",
                      "type": "uint64"
                    },
                    {
                      "internalType": "bytes32",
                      "name": "presaleMerkleRoot",
                      "type": "bytes32"
                    }
                  ],
                  "internalType": "struct IERC721Drop.SalesConfiguration",
                  "name": "saleConfig",
                  "type": "tuple"
                },
                {
                  "internalType": "string",
                  "name": "metadataURIBase",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "metadataContractURI",
                  "type": "string"
                }
              ],
              "name": "createDrop",
              "outputs": [
                {
                  "internalType": "address",
                  "name": "",
                  "type": "address"
                }
              ],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "string",
                  "name": "name",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "symbol",
                  "type": "string"
                },
                {
                  "internalType": "address",
                  "name": "defaultAdmin",
                  "type": "address"
                },
                {
                  "internalType": "uint64",
                  "name": "editionSize",
                  "type": "uint64"
                },
                {
                  "internalType": "uint16",
                  "name": "royaltyBPS",
                  "type": "uint16"
                },
                {
                  "internalType": "address payable",
                  "name": "fundsRecipient",
                  "type": "address"
                },
                {
                  "components": [
                    {
                      "internalType": "uint104",
                      "name": "publicSalePrice",
                      "type": "uint104"
                    },
                    {
                      "internalType": "uint32",
                      "name": "maxSalePurchasePerAddress",
                      "type": "uint32"
                    },
                    {
                      "internalType": "uint64",
                      "name": "publicSaleStart",
                      "type": "uint64"
                    },
                    {
                      "internalType": "uint64",
                      "name": "publicSaleEnd",
                      "type": "uint64"
                    },
                    {
                      "internalType": "uint64",
                      "name": "presaleStart",
                      "type": "uint64"
                    },
                    {
                      "internalType": "uint64",
                      "name": "presaleEnd",
                      "type": "uint64"
                    },
                    {
                      "internalType": "bytes32",
                      "name": "presaleMerkleRoot",
                      "type": "bytes32"
                    }
                  ],
                  "internalType": "struct IERC721Drop.SalesConfiguration",
                  "name": "saleConfig",
                  "type": "tuple"
                },
                {
                  "internalType": "string",
                  "name": "metadataURIBase",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "metadataContractURI",
                  "type": "string"
                },
                {
                  "internalType": "address",
                  "name": "createReferral",
                  "type": "address"
                }
              ],
              "name": "createDropWithReferral",
              "outputs": [
                {
                  "internalType": "address",
                  "name": "",
                  "type": "address"
                }
              ],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "string",
                  "name": "name",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "symbol",
                  "type": "string"
                },
                {
                  "internalType": "uint64",
                  "name": "editionSize",
                  "type": "uint64"
                },
                {
                  "internalType": "uint16",
                  "name": "royaltyBPS",
                  "type": "uint16"
                },
                {
                  "internalType": "address payable",
                  "name": "fundsRecipient",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "defaultAdmin",
                  "type": "address"
                },
                {
                  "components": [
                    {
                      "internalType": "uint104",
                      "name": "publicSalePrice",
                      "type": "uint104"
                    },
                    {
                      "internalType": "uint32",
                      "name": "maxSalePurchasePerAddress",
                      "type": "uint32"
                    },
                    {
                      "internalType": "uint64",
                      "name": "publicSaleStart",
                      "type": "uint64"
                    },
                    {
                      "internalType": "uint64",
                      "name": "publicSaleEnd",
                      "type": "uint64"
                    },
                    {
                      "internalType": "uint64",
                      "name": "presaleStart",
                      "type": "uint64"
                    },
                    {
                      "internalType": "uint64",
                      "name": "presaleEnd",
                      "type": "uint64"
                    },
                    {
                      "internalType": "bytes32",
                      "name": "presaleMerkleRoot",
                      "type": "bytes32"
                    }
                  ],
                  "internalType": "struct IERC721Drop.SalesConfiguration",
                  "name": "saleConfig",
                  "type": "tuple"
                },
                {
                  "internalType": "string",
                  "name": "description",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "animationURI",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "imageURI",
                  "type": "string"
                }
              ],
              "name": "createEdition",
              "outputs": [
                {
                  "internalType": "address",
                  "name": "",
                  "type": "address"
                }
              ],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "string",
                  "name": "name",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "symbol",
                  "type": "string"
                },
                {
                  "internalType": "uint64",
                  "name": "editionSize",
                  "type": "uint64"
                },
                {
                  "internalType": "uint16",
                  "name": "royaltyBPS",
                  "type": "uint16"
                },
                {
                  "internalType": "address payable",
                  "name": "fundsRecipient",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "defaultAdmin",
                  "type": "address"
                },
                {
                  "components": [
                    {
                      "internalType": "uint104",
                      "name": "publicSalePrice",
                      "type": "uint104"
                    },
                    {
                      "internalType": "uint32",
                      "name": "maxSalePurchasePerAddress",
                      "type": "uint32"
                    },
                    {
                      "internalType": "uint64",
                      "name": "publicSaleStart",
                      "type": "uint64"
                    },
                    {
                      "internalType": "uint64",
                      "name": "publicSaleEnd",
                      "type": "uint64"
                    },
                    {
                      "internalType": "uint64",
                      "name": "presaleStart",
                      "type": "uint64"
                    },
                    {
                      "internalType": "uint64",
                      "name": "presaleEnd",
                      "type": "uint64"
                    },
                    {
                      "internalType": "bytes32",
                      "name": "presaleMerkleRoot",
                      "type": "bytes32"
                    }
                  ],
                  "internalType": "struct IERC721Drop.SalesConfiguration",
                  "name": "saleConfig",
                  "type": "tuple"
                },
                {
                  "internalType": "string",
                  "name": "description",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "animationURI",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "imageURI",
                  "type": "string"
                },
                {
                  "internalType": "address",
                  "name": "createReferral",
                  "type": "address"
                }
              ],
              "name": "createEditionWithReferral",
              "outputs": [
                {
                  "internalType": "address",
                  "name": "",
                  "type": "address"
                }
              ],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "implementation",
              "outputs": [
                {
                  "internalType": "address",
                  "name": "",
                  "type": "address"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "editionMetadataRenderer",
              "outputs": [
                {
                  "internalType": "contract EditionMetadataRenderer",
                  "name": "",
                  "type": "address"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
                "inputs": [],
                "name": "dropMetadataRenderer",
                "outputs": [
                  {
                    "internalType": "contract DropMetadataRenderer",
                    "name": "",
                    "type": "address"
                  }
                ],
                "stateMutability": "view",
                "type": "function"
              },
              {
                "inputs": [
                  {
                    "internalType": "string",
                    "name": "name",
                    "type": "string"
                  },
                  {
                    "internalType": "string",
                    "name": "symbol",
                    "type": "string"
                  },
                  {
                    "internalType": "address",
                    "name": "defaultAdmin",
                    "type": "address"
                  },
                  {
                    "internalType": "uint64",
                    "name": "editionSize",
                    "type": "uint64"
                  },
                  {
                    "internalType": "uint16",
                    "name": "royaltyBPS",
                    "type": "uint16"
                  },
                  {
                    "internalType": "address payable",
                    "name": "fundsRecipient",
                    "type": "address"
                  },
                  {
                    "components": [
                      {
                        "internalType": "uint104",
                        "name": "publicSalePrice",
                        "type": "uint104"
                      },
                      {
                        "internalType": "uint32",
                        "name": "maxSalePurchasePerAddress",
                        "type": "uint32"
                      },
                      {
                        "internalType": "uint64",
                        "name": "publicSaleStart",
                        "type": "uint64"
                      },
                      {
                        "internalType": "uint64",
                        "name": "publicSaleEnd",
                        "type": "uint64"
                      },
                      {
                        "internalType": "uint64",
                        "name": "presaleStart",
                        "type": "uint64"
                      },
                      {
                        "internalType": "uint64",
                        "name": "presaleEnd",
                        "type": "uint64"
                      },
                      {
                        "internalType": "bytes32",
                        "name": "presaleMerkleRoot",
                        "type": "bytes32"
                      }
                    ],
                    "internalType": "struct IERC721Drop.SalesConfiguration",
                    "name": "saleConfig",
                    "type": "tuple"
                  },
                  {
                    "internalType": "contract IMetadataRenderer",
                    "name": "metadataRenderer",
                    "type": "address"
                  },
                  {
                    "internalType": "bytes",
                    "name": "metadataInitializer",
                    "type": "bytes"
                  },
                  {
                    "internalType": "address",
                    "name": "createReferral",
                    "type": "address"
                  }
                ],
                "name": "setupDropsContract",
                "outputs": [
                  {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                  }
                ],
                "stateMutability": "nonpayable",
                "type": "function"
              }
            ] 
] as const;
