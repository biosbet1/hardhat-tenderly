"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extendEthers = void 0;
const TdlyContract_1 = require("../types/TdlyContract");
const TdlyContractFactory_1 = require("../types/TdlyContractFactory");
function extendEthers(hre) {
    if ("ethers" in hre &&
        hre.ethers !== undefined &&
        hre.ethers !== null &&
        "tenderly" in hre &&
        hre.tenderly !== undefined) {
        Object.assign(hre.ethers, wrapEthers(hre.ethers, hre.tenderly));
    }
}
exports.extendEthers = extendEthers;
function wrapEthers(nativeEthers, tenderly) {
    // Factory
    nativeEthers.getContractFactoryFromArtifact =
        wrapGetContractFactoryFromArtifact(nativeEthers.getContractFactoryFromArtifact, tenderly);
    nativeEthers.getContractFactory = wrapGetContractFactory(nativeEthers.getContractFactory, tenderly);
    // Ethers's deployContract
    nativeEthers.deployContract = wrapDeployContract(nativeEthers.deployContract, tenderly);
    // Contract
    nativeEthers.getContractAtFromArtifact = wrapGetContractAtFromArtifact(nativeEthers.getContractAtFromArtifact, tenderly);
    nativeEthers.getContractAt = wrapGetContractAt(nativeEthers.getContractAt, tenderly);
    return nativeEthers;
}
function wrapGetContractFactory(func, tenderly) {
    return async function (nameOrAbi, bytecodeOrFactoryOptions, signer) {
        if (typeof nameOrAbi === "string") {
            const contractFactory = await func(nameOrAbi, bytecodeOrFactoryOptions);
            let libs;
            const factoryOpts = bytecodeOrFactoryOptions;
            if (factoryOpts !== undefined && "libraries" in factoryOpts) {
                libs = factoryOpts.libraries;
            }
            return wrapContractFactory(contractFactory, tenderly, nameOrAbi, libs);
        }
        return func(nameOrAbi, bytecodeOrFactoryOptions, signer);
    };
}
function wrapDeployContract(func, tenderly) {
    return async function (name, signerOrOptions) {
        const contract = await func(name, signerOrOptions);
        let libraries;
        if (signerOrOptions !== undefined && "libraries" in signerOrOptions) {
            libraries = signerOrOptions.libraries;
        }
        return new TdlyContract_1.TdlyContract(contract, tenderly, name, libraries);
    };
}
function wrapGetContractAt(func, tenderly) {
    return async function (nameOrAbi, address, signer) {
        if (typeof nameOrAbi === "string") {
            const contract = await func(nameOrAbi, address, signer);
            await tryToVerify(tenderly, nameOrAbi, contract);
            return contract;
        }
        return func(nameOrAbi, address, signer);
    };
}
function wrapGetContractFactoryFromArtifact(func, tenderly) {
    return async function (artifact, signerOrOptions) {
        const contractFactory = await func(artifact, signerOrOptions);
        let libs;
        const factoryOpts = signerOrOptions;
        if (factoryOpts !== undefined && "libraries" in factoryOpts) {
            libs = factoryOpts.libraries;
        }
        return wrapContractFactory(contractFactory, tenderly, artifact.contractName, libs);
    };
}
function wrapGetContractAtFromArtifact(func, tenderly) {
    return async function (artifact, address, signer) {
        const contract = await func(artifact, address, signer);
        await tryToVerify(tenderly, artifact.contractName, contract);
        return contract;
    };
}
function wrapContractFactory(contractFactory, tenderly, name, libraries) {
    contractFactory = new TdlyContractFactory_1.TdlyContractFactory(contractFactory, tenderly, name, libraries);
    return contractFactory;
}
async function tryToVerify(tenderly, name, contract) {
    await tenderly.verify({
        name,
        address: await contract.getAddress(),
    });
}
//# sourceMappingURL=extend-ethers.js.map