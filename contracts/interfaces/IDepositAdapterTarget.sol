// The Licensed Work is (c) 2022 Sygma
// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.11;

interface IDepositAdapterTarget {
    function execute(bytes calldata executeData) external;
}