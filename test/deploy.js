const {Conflux,Drip} = require('js-conflux-sdk')
const {abi, bytecode} = require('../build/contracts/ConfluxConsortiumNFT.json')
let url = 'https://test.confluxrpc.com'
// let url = 'https://main.confluxrpc.com'
let metaUri = url.includes('test') ?
	'https://testnet.confluxscan.io' : 'https://confluxscan.io/'
metaUri = `${metaUri}/stat/ConfluxConsortiumNFT?id=`
const cfx = new Conflux({url})
const key = '';
let account;

async function accInfo(acc, msg = '') {
	const balance = await cfx.getBalance(acc.address || acc)
	console.log(`${msg} ${acc} balance ${balance} = ${new Drip(balance).toCFX()}`)
	return balance
}

async function deploy() {
	await cfx.updateNetworkId();
	account = cfx.wallet.addPrivateKey(key);
	const balance = await accInfo(account, '')
	if (balance === 0n) {
		return
	}
	const contract = cfx.Contract({abi, bytecode});
	// const receipt = await contract.constructor().sendTransaction({
	// 	from: account.address,
	// }).executed()
	// const contractAddr = receipt.contractCreated
	const contractAddr = 'cfxtest:acdc7ftrn1p8f13u27zbz5atm2e7s5k9r2ma8kvfkb'
	contract.address = contractAddr
	console.log(` deploy contract, ${contractAddr}`)
	//
	const count = 100;
	const receivers = []
	for (let i = 0; i < count; i++) {
		const accountRnd = cfx.wallet.addRandom()
		receivers.push(accountRnd.address)
	}
	// await mint(contract, receivers)
	try {
		await mint(contract, receivers) // locked
	} catch (e) {
		console.log(`expect error, ${e.message}`)
	}
	// await testTransfer(contract, receivers[0])
	// await setAdmin2zero(contractAddr)
	await setBaseUrl(contract)

	console.log(`Done.`)
}
async function setBaseUrl(contract) {
	// await contract.setBaseURI(metaUri).sendTransaction({
	// 	from: account.address
	// }).executed()
	const uri = await contract.tokenURI(0);
	console.log(` token uri ${uri}`)
	if (uri !== (metaUri+0)) {
		throw new Error(`not wanted, expect ${metaUri+0}, actual ${uri}`)
	}
}
async function setAdmin2zero(contract) {
	await setAdmin(contract,'0x0000000000000000000000000000000000000000');
}

async function setAdmin(addr, to) {
	const adminControl = cfx.InternalContract('AdminControl');
	let receipt = await adminControl.setAdmin(addr, to).sendTransaction({
		from: account.address
	}).executed();
	console.log(`setAdmin tx hash: ${receipt.transactionHash}`);

	let newAdmin = await adminControl.getAdmin(addr);
	console.log(`new admin is ${newAdmin}`);
}

async function mint(contract, receivers) {
	const ids = receivers.map((_, idx) => idx)
	const receipt = await contract.mintBatch(receivers, ids).sendTransaction({
		from: account.address,
	}).executed()
	console.log(` mint batch , hash ${receipt.transactionHash}`)
}

async function testTransfer(contract, self) {
	const receipt = await contract.transferFrom(self, self, 0).sendTransaction({
		from: self
	}).executed()
	console.log(` test transfer, hash ${receipt.transactionHash}`)
}

deploy().then()
