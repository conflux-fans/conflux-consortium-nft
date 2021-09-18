// SPDX-License-Identifier: MIT
import './lib.sol';
pragma solidity ^0.8.0;

contract ConfluxConsortiumNFT is AccessControlEnumerable, ERC721, ERC721URIStorage, CRC721Enumerable {

  // ---------- state variables ----------
  string private _baseUri;
  bool private _locked;


  // ---------- public interface ----------
  constructor() ERC721('CFXConsortium NFT','CFXCS-NFT') {
    _baseUri = 'NotSet';
    _locked = false;
    _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
  }

  function setBaseURI(string memory baseUri) public onlyRole(DEFAULT_ADMIN_ROLE) {
    _baseUri = baseUri;
  }


  function mintBatch(address[] calldata owners, uint256[] calldata tokenIds) public onlyRole(DEFAULT_ADMIN_ROLE) {
    require(_locked == false, 'Already locked, can not mint any more.');
    require(owners.length == tokenIds.length, "length mismatch");

    for (uint256 ii = 0; ii < owners.length; ++ii) {
      _mint(owners[ii], tokenIds[ii]);
    }
    _locked = true;
  }


  // ---------- inherited interface ----------
  function _baseURI() internal view override returns (string memory) {
    return _baseUri;
  }

  function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
    super._burn(tokenId);
  }

  function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
    return super.tokenURI(tokenId);
  }

  function _beforeTokenTransfer(address from, address to, uint256 tokenId)
  internal
  virtual
  override(ERC721, ERC721Enumerable)
  {
    super._beforeTokenTransfer(from, to, tokenId);
  }

  function supportsInterface(bytes4 interfaceId)
  public
  view
  override(ERC721, ERC721Enumerable, AccessControlEnumerable)
  returns (bool)
  {
    return super.supportsInterface(interfaceId);
  }
}
